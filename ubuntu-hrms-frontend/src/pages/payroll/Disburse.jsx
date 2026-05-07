import React, { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import DashboardLayout from '../../components/DashboardLayout'
import { payrollAPI } from '../../services/api'

const formatMoney = (value) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(Number(value || 0))

export default function PayrollDisburse() {
  const [payslips, setPayslips] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [summary, setSummary] = useState(null)

  const activePayslips = useMemo(() => {
    return payslips.filter((payslip) => ['approved', 'processing', 'paid', 'failed'].includes(String(payslip.status).toLowerCase()))
  }, [payslips])

  const readyToDisburseCount = activePayslips.filter(p => String(p.status).toLowerCase() === 'approved').length;

  const totalsByPeriod = useMemo(() => {
    return activePayslips.reduce((accumulator, payslip) => {
      const period = payslip.period || 'Unknown'
      if (!accumulator[period]) {
        accumulator[period] = { count: 0, netPay: 0 }
      }
      accumulator[period].count += 1
      accumulator[period].netPay += Number(payslip.net_pay || 0)
      return accumulator
    }, {})
  }, [approvedPayslips])

  const loadData = async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      const response = await payrollAPI.getPayslips()
      setPayslips(response.data || [])
      if (!silent) setError('')
    } catch (loadError) {
      console.error('Failed to load payroll data', loadError)
      if (!silent) {
        setError(loadError.response?.data?.error || 'Failed to load payroll data')
        toast.error('Failed to load payroll data')
      }
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Silent Polling for M-Pesa Callbacks
  useEffect(() => {
    let interval;
    const hasProcessing = payslips.some(p => String(p.status).toLowerCase() === 'processing');
    
    if (hasProcessing) {
      interval = setInterval(() => {
        loadData(true); // Silently poll every 5 seconds
      }, 5000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [payslips]);

  const initiateDisbursement = async () => {
    try {
      setSubmitting(true)
      const response = await payrollAPI.disburse()
      setSummary(response.data?.summary || null)
      toast.success(response.data?.message || 'Payroll disbursement started')
      await loadData()
    } catch (disburseError) {
      const message = disburseError.response?.data?.error || disburseError.message || 'Failed to start disbursement'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">Payroll Disbursement</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Review approved payslips and trigger M-Pesa or bank payout batches from one place.
          </p>
        </div>
        <button
          onClick={initiateDisbursement}
          disabled={submitting || readyToDisburseCount === 0}
          className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
        >
          {submitting ? 'Initiating Disbursement...' : `Disburse ${readyToDisburseCount} Payslip(s)`}
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      )}

      {summary && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[
            ['Total', summary.total],
            ['Paid', summary.paid],
            ['Processing', summary.processing],
            ['Failed', summary.failed],
            ['M-Pesa / Bank', `${summary.mpesa || 0} / ${summary.bank || 0}`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
              <div className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Approved Payslips</h2>
          </div>

          {loading && activePayslips.length === 0 ? (
            <div className="space-y-3 p-6">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="h-16 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
              ))}
            </div>
          ) : activePayslips.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">No active payslip records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-800">
                <thead className="bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                  <tr>
                    <th className="px-4 py-3 font-medium">Employee</th>
                    <th className="px-4 py-3 font-medium">Period</th>
                    <th className="px-4 py-3 font-medium">Method</th>
                    <th className="px-4 py-3 font-medium">Net Pay</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {activePayslips.map((payslip) => {
                    const statusLower = String(payslip.status).toLowerCase();
                    const statusColor = 
                      statusLower === 'paid' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' :
                      statusLower === 'failed' ? 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200' :
                      statusLower === 'processing' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
                      
                    return (
                      <tr key={payslip.id}>
                        <td className="px-4 py-4 text-slate-950 dark:text-white">
                          {[payslip.first_name, payslip.last_name].filter(Boolean).join(' ') || `Employee ${payslip.employee_id}`}
                        </td>
                        <td className="px-4 py-4 text-slate-700 dark:text-slate-300">{payslip.period}</td>
                        <td className="px-4 py-4 text-slate-700 dark:text-slate-300">{payslip.payment_method}</td>
                        <td className="px-4 py-4 font-semibold text-slate-950 dark:text-white">{formatMoney(payslip.net_pay)}</td>
                        <td className="px-4 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor}`}>
                            {payslip.status === 'Processing' ? '⏳ Processing' : payslip.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Monthly Payroll Summary</h3>
            <div className="mt-4 space-y-3">
              {Object.keys(totalsByPeriod).length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  Approved payroll totals will appear here.
                </div>
              ) : (
                Object.entries(totalsByPeriod).map(([period, metrics]) => (
                  <div key={period} className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                    <div className="text-sm font-semibold text-slate-950 dark:text-white">{period}</div>
                    <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">{metrics.count} payslip(s)</div>
                    <div className="mt-1 text-lg font-bold text-slate-950 dark:text-white">{formatMoney(metrics.netPay)}</div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm dark:bg-white dark:text-slate-950">
            <h3 className="text-lg font-semibold">Disbursement Status</h3>
            <p className="mt-2 text-sm text-slate-300 dark:text-slate-700">
              M-Pesa disbursements move to Processing first and are finalized by the callback webhook.
            </p>
            <p className="mt-2 text-sm text-slate-300 dark:text-slate-700">
              Bank transfers are marked Paid immediately after the mock EFT batch is generated.
            </p>
          </section>
        </aside>
      </div>
    </DashboardLayout>
  )
}
