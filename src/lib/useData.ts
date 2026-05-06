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
    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        setCompanies([]);
        setViolationTypes([]);
        setViolations([]);
        setSuspensions([]);
        setAppeals([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      let counts = 0;
      const checkDone = () => {
        counts++;
        if (counts === 5) setLoading(false);
      };

      const unsubCompanies = onSnapshot(collection(db, 'companies'), (snapshot) => {
        setCompanies(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Company)));
        checkDone();
      }, (err) => { handleFirestoreError(err, OperationType.LIST, 'companies'); checkDone(); });

      const unsubTypes = onSnapshot(collection(db, 'violationTypes'), (snapshot) => {
        setViolationTypes(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ViolationType)));
        checkDone();
      }, (err) => { handleFirestoreError(err, OperationType.LIST, 'violationTypes'); checkDone(); });

      const unsubViolations = onSnapshot(query(collection(db, 'violations'), orderBy('date', 'desc')), (snapshot) => {
        setViolations(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ViolationRecord)));
        checkDone();
      }, (err) => { handleFirestoreError(err, OperationType.LIST, 'violations'); checkDone(); });

      const unsubSuspensions = onSnapshot(collection(db, 'suspensions'), (snapshot) => {
        setSuspensions(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as SuspensionRecord)));
        checkDone();
      }, (err) => { handleFirestoreError(err, OperationType.LIST, 'suspensions'); checkDone(); });

      const unsubAppeals = onSnapshot(collection(db, 'appeals'), (snapshot) => {
        setAppeals(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AppealRecord)));
        checkDone();
      }, (err) => { handleFirestoreError(err, OperationType.LIST, 'appeals'); checkDone(); });

      return () => {
        unsubCompanies();
        unsubTypes();
        unsubViolations();
        unsubSuspensions();
        unsubAppeals();
      };
    });

    return () => unsubAuth();
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
