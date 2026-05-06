import * as XLSX from 'xlsx';
import { ViolationRecord, Company } from '../types';

export function exportViolationsToExcel(violations: ViolationRecord[], companies: Company[], filename: string) {
  const data = violations.map(v => {
    const co = companies.find(c => c.id === v.companyId);
    return {
      '公司名稱': co?.name || '未知',
      '統編': co?.taxId || '',
      '違規日期': v.date,
      '違規等級': v.level,
      '違規態樣': v.violationTypeName,
      '函文字號': v.docNumber || '',
      '說明': v.description || '',
      '是否撤銷': v.isCancelled ? '是' : '否',
      '撤銷理由': v.cancelReason || '',
      '申訴說明': v.appeal?.explanation || '',
      '申訴文件': v.appeal?.fileName || ''
    };
  });

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '違規總表');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}
