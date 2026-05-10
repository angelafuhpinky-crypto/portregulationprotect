import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp
} from 'firebase/firestore';
import { db, OperationType, handleFirestoreError, auth } from './firebase';
import { 
  Company, 
  ViolationType, 
  ViolationRecord, 
  SuspensionRecord, 
  CompanyStats,
  AppealRecord
} from '../types';

export function useData() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [violationTypes, setViolationTypes] = useState<ViolationType[]>([]);
  const [violations, setViolations] = useState<ViolationRecord[]>([]);
  const [suspensions, setSuspensions] = useState<SuspensionRecord[]>([]);
  const [appeals, setAppeals] = useState<AppealRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let counts = 0;
    const TOTAL_STREAMS = 5;
    const checkDone = () => {
      counts++;
      if (counts === TOTAL_STREAMS) setLoading(false);
    };

    // Public collections
    const unsubCompanies = onSnapshot(collection(db, 'companies'), (snapshot) => {
      setCompanies(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Company)));
      checkDone();
    }, (err) => { handleFirestoreError(err, OperationType.LIST, 'companies'); checkDone(); });

    const unsubTypes = onSnapshot(collection(db, 'violationTypes'), (snapshot) => {
      setViolationTypes(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ViolationType)));
      checkDone();
    }, (err) => { handleFirestoreError(err, OperationType.LIST, 'violationTypes'); checkDone(); });

    // Auth-dependent collections
    let unsubViolations = () => {};
    let unsubSuspensions = () => {};
    let unsubAppeals = () => {};

    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        setViolations([]);
        setSuspensions([]);
        setAppeals([]);
        // Even if not logged in, we mark these as "done" for loading state purposes
        if (counts < TOTAL_STREAMS) {
           // If we're still in the initial loading phase, and no user, 
           // we just mark them as empty but finished
           if (counts < 2) { /* companies and types might still be loading */ }
           // Special case: if no user, we still need to finish the loading
           // But since we want to wait for companies/types, we can't just call checkDone 3 times here
        }
        return;
      }

      unsubViolations = onSnapshot(query(collection(db, 'violations'), orderBy('date', 'desc')), (snapshot) => {
        setViolations(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ViolationRecord)));
        checkDone();
      }, (err) => { handleFirestoreError(err, OperationType.LIST, 'violations'); checkDone(); });

      unsubSuspensions = onSnapshot(collection(db, 'suspensions'), (snapshot) => {
        setSuspensions(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as SuspensionRecord)));
        checkDone();
      }, (err) => { handleFirestoreError(err, OperationType.LIST, 'suspensions'); checkDone(); });

      unsubAppeals = onSnapshot(collection(db, 'appeals'), (snapshot) => {
        setAppeals(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AppealRecord)));
        checkDone();
      }, (err) => { handleFirestoreError(err, OperationType.LIST, 'appeals'); checkDone(); });
    });

    // If no user after a moment, we should still allow loading to finish for public data
    const timeout = setTimeout(() => {
      if (!auth.currentUser) {
        // Mark auth collections as empty but finished
        for(let i=0; i<3; i++) checkDone();
      }
    }, 2000);

    return () => {
      unsubCompanies();
      unsubTypes();
      unsubViolations();
      unsubSuspensions();
      unsubAppeals();
      unsubAuth();
      clearTimeout(timeout);
    };
  }, []);

  const addRecord = async (coll: string, data: Record<string, unknown>) => {
    try {
      const res = await addDoc(collection(db, coll), {
        ...data,
        createdAt: serverTimestamp()
      });
      return res.id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, coll);
    }
  };

  const updateRecord = async (coll: string, id: string, data: Record<string, unknown>) => {
    try {
      await updateDoc(doc(db, coll, id), data);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${coll}/${id}`);
    }
  };

  const removeRecord = async (coll: string, id: string) => {
    try {
      await deleteDoc(doc(db, coll, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${coll}/${id}`);
    }
  };

  const currentYear = new Date().getFullYear();

  const companyStats: CompanyStats[] = companies.map(co => {
    const coViolations = violations.filter(v => v.companyId === co.id);
    const activeViolations = coViolations.filter(v => v.year === currentYear && !v.isCancelled);
    const activeSuspension = suspensions.find(s => {
      const today = new Date().toISOString().split('T')[0];
      return s.companyId === co.id && s.startDate <= today && s.endDate >= today;
    });

    return {
      company: co,
      violations: coViolations,
      totalPoints: activeViolations.length, // Each record is 1 point
      activeSuspension,
      isAtThreshold: activeViolations.length >= 5
    };
  });

  return {
    companies,
    violationTypes,
    violations,
    suspensions,
    appeals,
    companyStats,
    loading,
    addRecord,
    updateRecord,
    removeRecord
  };
}
