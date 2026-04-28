import { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle, AlertTriangle, Info, Shield } from 'lucide-react';
import { scoreATS } from '../utils/atsScorer';

const severityConfig = {
  critical: { color: '#ef4444', label: 'Critical', Icon: XCircle },
  high:     { color: '#f97316', label: 'High',     Icon: AlertTriangle },
  medium:   { color: '#eab308', label: 'Medium',   Icon: AlertTriangle },
  low:      { color: '#3b82f6', label: 'Low',      Icon: Info },
  info:     { color: '#22c55e', label: 'Info',      Icon: Info }
};

function getGradeColor(grade) {
  switch (grade) {
    case 'A': return '#22c55e';
    case 'B': return '#3b82f6';
    case 'C': return '#eab308';
    case 'D': return '#f97316';
    case 'F': return '#ef4444';
    default: return '#94a3b8';
  }
}

export default function ATSScoreModal({ cvData, onClose }) {
  const [report, setReport] = useState(null);

  useEffect(() => {
    if (cvData) {
      const result = scoreATS(cvData);
      setReport(result);
    }
  }, [cvData]);

  if (!report) return null;

  const categories = {};
  report.checks.forEach(check => {
    if (!categories[check.category]) categories[check.category] = [];
    categories[check.category].push(check);
  });

  const passedCount = report.checks.filter(c => c.passed).length;
  const failedCount = report.checks.filter(c => !c.passed).length;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(8px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      animation: 'fadeIn 0.3s ease-out'
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-card)',
        borderRadius: '16px',
        width: '90%', maxWidth: '640px', maxHeight: '85vh',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        display: 'flex', flexDirection: 'column'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{
          padding: '1.5rem 1.5rem 1rem',
          borderBottom: '1px solid var(--border-card)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Shield size={28} style={{ color: getGradeColor(report.grade) }} />
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
                ATS Compliance Report
              </h2>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {passedCount} passed · {failedCount} need attention
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', padding: '0.25rem'
          }}>
            <X size={20} />
          </button>
        </div>

        {/* Score Circle */}
        <div style={{
          padding: '1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem',
          borderBottom: '1px solid var(--border-card)'
        }}>
          <div style={{ position: 'relative', width: 100, height: 100 }}>
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
              <circle cx="50" cy="50" r="42" fill="none"
                stroke={getGradeColor(report.grade)}
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${report.percentage * 2.64} ${264 - report.percentage * 2.64}`}
                strokeDashoffset="66"
                style={{ transition: 'stroke-dasharray 1s ease-out' }}
              />
            </svg>
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: getGradeColor(report.grade) }}>
                {report.percentage}
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>/ 100</span>
            </div>
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{
              fontSize: '2rem', fontWeight: 800, 
              color: getGradeColor(report.grade), lineHeight: 1
            }}>
              Grade {report.grade}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem', maxWidth: 220 }}>
              {report.percentage >= 90 
                ? 'Excellent! Your CV is highly ATS-optimized.'
                : report.percentage >= 75 
                ? 'Good foundation. Fix the flagged items to boost your score.'
                : report.percentage >= 60 
                ? 'Needs improvement. Several critical items need attention.'
                : 'Your CV has significant ATS compliance issues. Review below.'}
            </div>
          </div>
        </div>

        {/* Checks List */}
        <div style={{
          padding: '1rem 1.5rem 1.5rem',
          overflowY: 'auto', flex: 1
        }}>
          {Object.entries(categories).map(([category, checks]) => (
            <div key={category} style={{ marginBottom: '1.25rem' }}>
              <h3 style={{
                fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem'
              }}>
                {category}
              </h3>
              {checks.map(check => {
                const severity = severityConfig[check.severity] || severityConfig.info;
                return (
                  <div key={check.id} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                    padding: '0.6rem 0',
                    borderBottom: '1px solid rgba(255,255,255,0.04)'
                  }}>
                    {check.passed 
                      ? <CheckCircle2 size={18} style={{ color: '#22c55e', flexShrink: 0, marginTop: 1 }} />
                      : <severity.Icon size={18} style={{ color: severity.color, flexShrink: 0, marginTop: 1 }} />
                    }
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '0.9rem', fontWeight: 500,
                        color: check.passed ? 'var(--text-main)' : severity.color
                      }}>
                        {check.label}
                        {!check.passed && (
                          <span style={{
                            marginLeft: '0.5rem', fontSize: '0.65rem',
                            padding: '1px 6px', borderRadius: '4px',
                            background: `${severity.color}22`, color: severity.color,
                            fontWeight: 600, verticalAlign: 'middle'
                          }}>
                            {severity.label}
                          </span>
                        )}
                      </div>
                      {check.detail && (
                        <div style={{
                          fontSize: '0.8rem', color: 'var(--text-muted)',
                          marginTop: '0.2rem', lineHeight: 1.4
                        }}>
                          {check.detail}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--border-card)',
          display: 'flex', justifyContent: 'flex-end'
        }}>
          <button className="btn" onClick={onClose} style={{ padding: '0.5rem 1.5rem' }}>
            Got it, close
          </button>
        </div>
      </div>
    </div>
  );
}
