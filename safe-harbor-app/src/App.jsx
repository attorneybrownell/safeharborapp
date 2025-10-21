import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Calendar, FileText, DollarSign, Zap, Download, Plus, Trash2, Calculator } from 'lucide-react';

const SafeHarborComplianceSystem = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: "Project Sunrise",
      capacity: 5.0,
      location: "Texas",
      totalCost: 8000000,
      allocatedCost: 520000,
      paymentDate: "2025-12-15",
      interconnectionStatus: "Conditional Approval",
      siteControl: true,
      permits: "Building Permit Submitted",
      estimatedPIS: "2028-06-30",
      group: 2,
      physicalWorkBy726: true,
      itcCompliance: {
        bocQualified: true,
        prevailingWage: true,
        apprenticeship: true,
        domesticContent: false,
        domesticContentPercentage: 0,
        energyCommunity: false,
        laborStandardsRegistered: true,
        continuousConstruction: true
      }
    }
  ]);
  const [selectedProject, setSelectedProject] = useState(null);

  // Calculate safe harbor percentage
  const calculateSafeHarborPercentage = (allocated, total) => {
    return ((allocated / total) * 100).toFixed(2);
  };

  // Determine BOC qualification track
  const determineBOCTrack = (capacity, paymentDate) => {
    const date = new Date(paymentDate);
    const feocDeadline = new Date('2025-12-31');
    const itcDeadline = new Date('2026-07-04');
    
    const canQualifyFEOC = date <= feocDeadline;
    const canQualify5Percent = capacity <= 1.5 && date <= itcDeadline;
    
    if (capacity > 1.5) {
      return {
        track: canQualifyFEOC ? "FEOC Exemption Only (5% safe harbor available)" : "Must use Physical Work Test",
        eligible: canQualifyFEOC,
        warning: !canQualifyFEOC,
        details: capacity > 1.5 ? "Projects >1.5MW cannot use 5% safe harbor for ITC/PTC after 9/2/25" : ""
      };
    } else {
      let track = [];
      if (canQualify5Percent) track.push("ITC/PTC via 5% safe harbor");
      if (canQualifyFEOC) track.push("FEOC exemption");
      
      return {
        track: track.length > 0 ? track.join(" + ") : "Neither track available",
        eligible: track.length > 0,
        warning: track.length === 0,
        details: ""
      };
    }
  };

  // Calculate 105-day delivery deadline
  const calculate105DayDeadline = (paymentDate) => {
    const date = new Date(paymentDate);
    date.setDate(date.getDate() + 105);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Calculate PIS deadline (4-year safe harbor)
  const calculatePISDeadline = (bocDate) => {
    const date = new Date(bocDate);
    date.setFullYear(date.getFullYear() + 4);
    date.setMonth(11, 31); // December 31st of that year
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // ITC Compliance Component
  const ITCCompliance = () => {
    const [selectedProjectForITC, setSelectedProjectForITC] = useState(projects[0] || null);

    const calculateITCRate = (project) => {
      if (!project?.itcCompliance) return { rate: 0, details: [] };
      
      let baseRate = 6; // Base ITC without labor standards
      let bonusRate = 0;
      let details = [];

      // Labor standards boost (prevailing wage + apprenticeship)
      if (project.itcCompliance.prevailingWage && project.itcCompliance.apprenticeship) {
        baseRate = 30;
        details.push("Base ITC: 30% (with labor standards)");
      } else {
        details.push("Base ITC: 6% (without labor standards)");
      }

      // Domestic content bonus (10%)
      if (project.itcCompliance.domesticContent) {
        bonusRate += 10;
        details.push("Domestic Content Bonus: +10%");
      }

      // Energy community bonus (10%)
      if (project.itcCompliance.energyCommunity) {
        bonusRate += 10;
        details.push("Energy Community Bonus: +10%");
      }

      const totalRate = baseRate + bonusRate;
      details.push(`TOTAL ITC RATE: ${totalRate}%`);

      return { rate: totalRate, details, baseRate, bonusRate };
    };

    const getComplianceStatus = (project) => {
      if (!project?.itcCompliance) return { status: 'Unknown', color: 'gray', issues: [] };
      
      const c = project.itcCompliance;
      const issues = [];

      if (!c.bocQualified) issues.push("BOC not qualified");
      if (!c.prevailingWage) issues.push("Prevailing wage not met");
      if (!c.apprenticeship) issues.push("Apprenticeship not met");
      if (!c.laborStandardsRegistered && (c.prevailingWage || c.apprenticeship)) {
        issues.push("Not registered with IRS for labor standards");
      }
      if (!c.continuousConstruction) issues.push("Continuous construction at risk");

      // Check group-specific issues
      const percentage = calculateSafeHarborPercentage(project.allocatedCost, project.totalCost);
      if (parseFloat(percentage) < 5.0) issues.push("Below 5% safe harbor threshold");

      if (issues.length === 0) {
        return { status: 'Compliant', color: 'green', issues: [] };
      } else if (issues.length <= 2) {
        return { status: 'At Risk', color: 'amber', issues };
      } else {
        return { status: 'Non-Compliant', color: 'red', issues };
      }
    };

    const updateProjectCompliance = (projectId, field, value) => {
      setProjects(projects.map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            itcCompliance: {
              ...p.itcCompliance,
              [field]: value
            }
          };
        }
        return p;
      }));
      
      // Update selected project if it's the one being edited
      if (selectedProjectForITC?.id === projectId) {
        setSelectedProjectForITC({
          ...selectedProjectForITC,
          itcCompliance: {
            ...selectedProjectForITC.itcCompliance,
            [field]: value
          }
        });
      }
    };

    const itcRate = selectedProjectForITC ? calculateITCRate(selectedProjectForITC) : null;
    const complianceStatus = selectedProjectForITC ? getComplianceStatus(selectedProjectForITC) : null;

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 rounded-lg shadow-md text-white">
          <h3 className="text-2xl font-bold mb-2">ITC Compliance Tracker</h3>
          <p className="text-green-100">Monitor Investment Tax Credit requirements and maximize credit rates</p>
        </div>

        {/* Portfolio Overview */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h4 className="text-lg font-bold text-gray-900 mb-4">Portfolio ITC Status</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[
              { 
                label: "Fully Compliant", 
                count: projects.filter(p => getComplianceStatus(p).status === 'Compliant').length,
                color: "green"
              },
              { 
                label: "At Risk", 
                count: projects.filter(p => getComplianceStatus(p).status === 'At Risk').length,
                color: "amber"
              },
              { 
                label: "Non-Compliant", 
                count: projects.filter(p => getComplianceStatus(p).status === 'Non-Compliant').length,
                color: "red"
              },
              { 
                label: "Average ITC Rate", 
                count: `${(projects.reduce((sum, p) => sum + calculateITCRate(p).rate, 0) / projects.length).toFixed(1)}%`,
                color: "blue"
              }
            ].map((stat, idx) => (
              <div key={idx} className={`p-4 rounded-lg border-2 bg-${stat.color}-50 border-${stat.color}-200`}>
                <p className={`text-sm font-medium text-${stat.color}-700`}>{stat.label}</p>
                <p className={`text-3xl font-bold text-${stat.color}-900`}>{stat.count}</p>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Project</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Group</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ITC Rate</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {projects.map(project => {
                  const rate = calculateITCRate(project);
                  const status = getComplianceStatus(project);
                  
                  return (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{project.name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded border ${
                          project.group === 1 || project.group === 2 ? 'bg-green-100 text-green-800 border-green-300' :
                          project.group === 3 ? 'bg-red-100 text-red-800 border-red-300' :
                          'bg-gray-800 text-white border-gray-900'
                        }`}>
                          Group {project.group}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="font-bold text-green-600">{rate.rate}%</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded bg-${status.color}-100 text-${status.color}-800`}>
                          {status.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedProjectForITC(project)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Manage Compliance
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Compliance Management */}
        {selectedProjectForITC && (
          <>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{selectedProjectForITC.name}</h4>
                  <p className="text-sm text-gray-600">{selectedProjectForITC.capacity} MW • {selectedProjectForITC.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Projected ITC Rate</p>
                  <p className="text-4xl font-bold text-green-600">{itcRate.rate}%</p>
                  <p className="text-xs text-gray-500 mt-1">on ${(selectedProjectForITC.totalCost / 1000000).toFixed(1)}M project</p>
                </div>
              </div>

              {/* ITC Rate Breakdown */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <h5 className="font-semibold text-blue-900 mb-2">ITC Rate Calculation</h5>
                <div className="space-y-1">
                  {itcRate.details.map((detail, idx) => (
                    <p key={idx} className={`text-sm ${idx === itcRate.details.length - 1 ? 'font-bold text-blue-900' : 'text-blue-800'}`}>
                      {detail}
                    </p>
                  ))}
                </div>
                <p className="text-sm text-blue-900 mt-3 font-semibold">
                  Projected Credit Value: ${((selectedProjectForITC.totalCost * itcRate.rate / 100) / 1000000).toFixed(2)}M
                </p>
              </div>

              {/* Compliance Status */}
              {complianceStatus.issues.length > 0 && (
                <div className={`mb-6 p-4 bg-${complianceStatus.color}-50 rounded-lg border-l-4 border-${complianceStatus.color}-500`}>
                  <div className="flex items-start gap-3">
                    <AlertCircle className={`text-${complianceStatus.color}-600 flex-shrink-0 mt-0.5`} size={20} />
                    <div>
                      <h5 className={`font-semibold text-${complianceStatus.color}-900 mb-2`}>Compliance Issues</h5>
                      <ul className="space-y-1">
                        {complianceStatus.issues.map((issue, idx) => (
                          <li key={idx} className={`text-sm text-${complianceStatus.color}-800`}>• {issue}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Compliance Checklist */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* BOC Qualification */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-semibold text-gray-900">Beginning of Construction</h5>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedProjectForITC.itcCompliance.bocQualified}
                        onChange={(e) => updateProjectCompliance(selectedProjectForITC.id, 'bocQualified', e.target.checked)}
                        className="w-5 h-5"
                      />
                      <span className={`text-sm font-medium ${selectedProjectForITC.itcCompliance.bocQualified ? 'text-green-600' : 'text-gray-400'}`}>
                        {selectedProjectForITC.itcCompliance.bocQualified ? 'Qualified' : 'Not Qualified'}
                      </span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-600">
                    5% safe harbor met or physical work test satisfied by applicable deadline
                  </p>
                </div>

                {/* Prevailing Wage */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-semibold text-gray-900">Prevailing Wage</h5>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedProjectForITC.itcCompliance.prevailingWage}
                        onChange={(e) => updateProjectCompliance(selectedProjectForITC.id, 'prevailingWage', e.target.checked)}
                        className="w-5 h-5"
                      />
                      <span className={`text-sm font-medium ${selectedProjectForITC.itcCompliance.prevailingWage ? 'text-green-600' : 'text-gray-400'}`}>
                        {selectedProjectForITC.itcCompliance.prevailingWage ? 'Compliant' : 'Not Met'}
                      </span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-600">
                    Required for 30% ITC rate (vs 6% base rate)
                  </p>
                </div>

                {/* Apprenticeship */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-semibold text-gray-900">Apprenticeship</h5>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedProjectForITC.itcCompliance.apprenticeship}
                        onChange={(e) => updateProjectCompliance(selectedProjectForITC.id, 'apprenticeship', e.target.checked)}
                        className="w-5 h-5"
                      />
                      <span className={`text-sm font-medium ${selectedProjectForITC.itcCompliance.apprenticeship ? 'text-green-600' : 'text-gray-400'}`}>
                        {selectedProjectForITC.itcCompliance.apprenticeship ? 'Compliant' : 'Not Met'}
                      </span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-600">
                    Required for 30% ITC rate (15% labor hours from apprentices)
                  </p>
                </div>

                {/* Labor Standards Registration */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-semibold text-gray-900">IRS Registration</h5>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedProjectForITC.itcCompliance.laborStandardsRegistered}
                        onChange={(e) => updateProjectCompliance(selectedProjectForITC.id, 'laborStandardsRegistered', e.target.checked)}
                        className="w-5 h-5"
                      />
                      <span className={`text-sm font-medium ${selectedProjectForITC.itcCompliance.laborStandardsRegistered ? 'text-green-600' : 'text-gray-400'}`}>
                        {selectedProjectForITC.itcCompliance.laborStandardsRegistered ? 'Registered' : 'Not Registered'}
                      </span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-600">
                    Pre-file registration with IRS for labor standards compliance
                  </p>
                </div>

                {/* Domestic Content */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-semibold text-gray-900">Domestic Content Bonus</h5>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedProjectForITC.itcCompliance.domesticContent}
                        onChange={(e) => updateProjectCompliance(selectedProjectForITC.id, 'domesticContent', e.target.checked)}
                        className="w-5 h-5"
                      />
                      <span className={`text-sm font-medium ${selectedProjectForITC.itcCompliance.domesticContent ? 'text-green-600' : 'text-gray-400'}`}>
                        {selectedProjectForITC.itcCompliance.domesticContent ? '+10%' : 'Not Met'}
                      </span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-600">
                    100% domestic steel/iron + applicable % of total costs from US manufacturing
                  </p>
                  {selectedProjectForITC.itcCompliance.domesticContent && (
                    <div className="mt-2">
                      <label className="text-xs text-gray-700 font-medium">Domestic Content %:</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={selectedProjectForITC.itcCompliance.domesticContentPercentage || 0}
                        onChange={(e) => updateProjectCompliance(selectedProjectForITC.id, 'domesticContentPercentage', parseFloat(e.target.value))}
                        className="w-full mt-1 px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                    </div>
                  )}
                </div>

                {/* Energy Community */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-semibold text-gray-900">Energy Community Bonus</h5>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedProjectForITC.itcCompliance.energyCommunity}
                        onChange={(e) => updateProjectCompliance(selectedProjectForITC.id, 'energyCommunity', e.target.checked)}
                        className="w-5 h-5"
                      />
                      <span className={`text-sm font-medium ${selectedProjectForITC.itcCompliance.energyCommunity ? 'text-green-600' : 'text-gray-400'}`}>
                        {selectedProjectForITC.itcCompliance.energyCommunity ? '+10%' : 'Not Eligible'}
                      </span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-600">
                    Located in brownfield site, coal closure area, or qualifying census tract
                  </p>
                </div>

                {/* Continuous Construction */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-semibold text-gray-900">Continuous Construction</h5>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedProjectForITC.itcCompliance.continuousConstruction}
                        onChange={(e) => updateProjectCompliance(selectedProjectForITC.id, 'continuousConstruction', e.target.checked)}
                        className="w-5 h-5"
                      />
                      <span className={`text-sm font-medium ${selectedProjectForITC.itcCompliance.continuousConstruction ? 'text-green-600' : 'text-gray-400'}`}>
                        {selectedProjectForITC.itcCompliance.continuousConstruction ? 'On Track' : 'At Risk'}
                      </span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-600">
                    Continuous efforts toward completion within 4-year safe harbor
                  </p>
                </div>
              </div>
            </div>

            {/* ITC Requirements Guide */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h4 className="text-lg font-bold text-gray-900 mb-4">ITC Requirements Overview</h4>
              
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <h5 className="font-semibold text-green-900 mb-2">30% Base ITC (Maximized Rate)</h5>
                  <p className="text-sm text-green-800 mb-2">To achieve 30% base rate, BOTH of these are required:</p>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>✓ Prevailing wage standards met throughout construction</li>
                    <li>✓ Apprenticeship requirements (12.5-15% of labor hours)</li>
                    <li>✓ Pre-file registration with IRS</li>
                  </ul>
                  <p className="text-xs text-green-700 mt-2 italic">
                    Without BOTH requirements: Falls to 6% base rate (4-6% IRR reduction)
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <h5 className="font-semibold text-blue-900 mb-2">Domestic Content Bonus (+10%)</h5>
                    <p className="text-sm text-blue-800 mb-2">Requirements vary by construction year:</p>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• 2025: 40% adjusted percentage</li>
                      <li>• 2026: 45% adjusted percentage</li>
                      <li>• 2027+: 55% adjusted percentage</li>
                      <li>• 100% domestic steel and iron (all years)</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                    <h5 className="font-semibold text-purple-900 mb-2">Energy Community Bonus (+10%)</h5>
                    <p className="text-sm text-purple-800 mb-2">Project must be located in:</p>
                    <ul className="text-xs text-purple-800 space-y-1">
                      <li>• Brownfield site, OR</li>
                      <li>• Census tract with coal mine/plant closure since 1999, OR</li>
                      <li>• Metropolitan/non-metro area with historical fossil fuel employment</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500">
                  <h5 className="font-semibold text-amber-900 mb-2">Maximum ITC Rate: 50%</h5>
                  <p className="text-sm text-amber-800">
                    30% Base (with labor standards) + 10% Domestic Content + 10% Energy Community = <span className="font-bold">50% ITC</span>
                  </p>
                  <p className="text-xs text-amber-700 mt-2">
                    On an $8M project: 50% ITC = $4M in tax credits
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  // Portfolio Strategy Component
  const PortfolioStrategy = () => {
    const groups = [
      {
        id: 1,
        name: "GROUP 1",
        subtitle: "≤1.5 MW AC",
        description: "Safe Harbor in 2025",
        note: "Rooftop, small C&I",
        riskLevel: "LOW RISK",
        riskColor: "green",
        actions: [
          { text: "Pay ≥5% of total project cost by", highlight: "December 31, 2025", important: true },
          { text: "Binding written contract with ≥5% liquidated damages", important: false },
          { text: "Document delivery expectation (105 days) or take title/risk of loss", important: false }
        ],
        note2: "Physical construction can start anytime through 2029",
        note3: "No additional BOC requirements",
        outcomes: [
          "BOC = 2025 (5% safe harbor)",
          "FEOC Exempt",
          "ITC/PTC Eligible",
          "PIS Deadline: 12/31/2029"
        ],
        summary: "Single action achieves all benefits",
        riskDetails: "Straightforward execution. No coordination between equipment purchase and construction schedule required."
      },
      {
        id: 2,
        name: "GROUP 2",
        subtitle: "> 1.5 MW AC",
        description: "Safe Harbor in 2025 With Physical Work by 7/4/26",
        note: "Ground mount, large C&I, community solar",
        riskLevel: "LOW RISK",
        riskColor: "green",
        actions: [
          { text: "Action 1: Pay ≥5% by", highlight: "December 31, 2025", important: true },
          { text: "Action 2: Initiate Physical Work by", highlight: "July 4, 2026", important: true }
        ],
        explanation: "Why two actions? Notice 2025-42 eliminated 5% safe harbor for ITC/PTC on projects >1.5MW",
        physicalWork: "Foundation excavation, anchor bolts, concrete pads, racking installation",
        outcomes: [
          "FEOC BOC = 2025 (5% safe harbor)",
          "ITC/PTC BOC = 2026 (physical work)",
          "FEOC Exempt",
          "ITC/PTC Eligible (30% credit)",
          "PIS Deadline: 12/31/2029"
        ],
        summary: "Maximum value preservation",
        riskDetails: "Requires coordination between equipment procurement and construction. Achievable with proper planning."
      },
      {
        id: 3,
        name: "GROUP 3",
        subtitle: "> 1.5 MW AC",
        description: "Safe Harbor in 2025 NO Physical Work by 7/4/26",
        note: "Late-stage development, permitting delays",
        riskLevel: "HIGH RISK",
        riskColor: "red",
        actions: [
          { text: "Pay ≥5% by", highlight: "December 31, 2025", important: true },
          { text: "Physical Work Test: NOT FEASIBLE by 7/4/26", important: false, warning: true }
        ],
        consequence: "Cannot establish ITC/PTC BOC. Project must reach PIS by December 31, 2027 to qualify for ITC, or ITC is permanently lost.",
        outcomes: [
          { text: "FEOC BOC = 2025 (5% safe harbor)", success: true },
          { text: "ITC/PTC BOC = FAILED", danger: true },
          { text: "FEOC Exempt (valuable for 2028 exit)", success: true },
          { text: "ITC/PTC At Risk", warning: true },
          { text: "PIS Deadline: 12/31/2027", danger: true }
        ],
        summary: "If ITC lost: ~4-6% IRR reduction",
        riskDetails: [
          "Compressed 2-year timeline to PIS",
          "4-6% IRR reduction if ITC lost",
          "Execution pressure on construction",
          "FEOC exemption maintains long-term value"
        ]
      },
      {
        id: 4,
        name: "GROUP 4",
        subtitle: "ANY Size",
        description: "NO Safe Harbor in 2025 Construction Start 2026/2027",
        note: "Speculative projects, uncertain permitting, low confidence",
        riskLevel: "VERY HIGH RISK",
        riskColor: "black",
        actions: [
          { text: "DO NOT pay 5% in 2025 (conserve capital)", important: true },
          { text: "Start physical construction in 2026 or 2027", important: false },
          { text: "Source equipment with required non-FEOC content:", important: false }
        ],
        bocRequirements: [
          { year: "2026 BOC:", requirement: "≥40% non-Chinese" },
          { year: "2027 BOC:", requirement: "≥45% non-Chinese" }
        ],
        macrNote: "Document Material Assistance Cost Ratio (MACR) compliance at PIS",
        equipmentChallenge: "~80% of solar modules are Chinese. Requires domestic sourcing strategy (higher cost, limited supply).",
        outcomes: [
          { text: "NO FEOC Exemption", danger: true },
          { text: "Subject to 40-45% MACR at PIS", danger: true },
          { text: "ITC/PTC Eligible (if proper BOC)", success: true },
          { text: "Must use domestic content equipment", danger: true },
          { text: "Equipment cost premium: +15-25%", danger: true }
        ],
        summary: "Total IRR reduction: ~6-10%",
        summary2: "Projects may be economically unviable",
        riskDetails: [
          "Economic Viability Threatened:",
          "Equipment costs +15-25%",
          "Limited domestic supply (long lead times)",
          "Unproven module performance",
          "IRR reduction ~6-10%",
          "May not justify development"
        ]
      }
    ];

    const getProjectsByGroup = (groupId) => {
      return projects.filter(p => p.group === groupId);
    };

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 rounded-lg shadow-md text-white">
          <h3 className="text-2xl font-bold mb-2">TRP 75MW Portfolio Strategy: BOC & FEOC Compliance</h3>
          <p className="text-purple-100">Strategic framework for managing different project compliance pathways</p>
        </div>

        {groups.map((group, index) => (
          <div key={group.id} className="bg-white rounded-lg shadow-lg border-2 border-gray-200 overflow-hidden">
            <div className={`p-6 ${group.riskColor === 'green' ? 'bg-green-50' : group.riskColor === 'red' ? 'bg-red-50' : 'bg-gray-900 text-white'}`}>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Project Group Info */}
                <div>
                  <h4 className={`text-xl font-bold ${group.riskColor === 'black' ? 'text-white' : 'text-gray-900'}`}>{group.name}</h4>
                  <p className={`text-lg font-semibold ${group.riskColor === 'black' ? 'text-gray-200' : 'text-gray-700'}`}>{group.subtitle}</p>
                  <p className={`font-medium mt-1 ${group.riskColor === 'black' ? 'text-gray-300' : 'text-gray-800'}`}>{group.description}</p>
                  {group.note && <p className={`text-sm italic mt-2 ${group.riskColor === 'black' ? 'text-gray-400' : 'text-gray-600'}`}>{group.note}</p>}
                  
                  {/* Assigned Projects */}
                  {getProjectsByGroup(group.id).length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-300">
                      <p className={`text-sm font-semibold mb-2 ${group.riskColor === 'black' ? 'text-gray-300' : 'text-gray-700'}`}>Assigned Projects:</p>
                      {getProjectsByGroup(group.id).map(p => (
                        <div key={p.id} className={`text-xs ${group.riskColor === 'black' ? 'text-gray-400' : 'text-gray-600'}`}>• {p.name}</div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions Required */}
                <div>
                  <h5 className={`font-bold mb-3 ${group.riskColor === 'black' ? 'text-white' : 'text-gray-900'}`}>Actions Required</h5>
                  <div className="space-y-2">
                    {group.actions.map((action, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className={`${group.riskColor === 'black' ? 'text-white' : 'text-gray-700'}`}>•</span>
                        <p className={`text-sm ${group.riskColor === 'black' ? 'text-gray-200' : 'text-gray-700'}`}>
                          {action.text} {action.highlight && <span className={`font-bold ${action.important ? 'bg-yellow-300 text-gray-900 px-1' : ''}`}>{action.highlight}</span>}
                        </p>
                      </div>
                    ))}
                  </div>

                  {group.explanation && (
                    <div className={`mt-3 p-2 ${group.riskColor === 'black' ? 'bg-gray-800' : 'bg-white'} rounded text-xs`}>
                      <p className={`font-semibold ${group.riskColor === 'black' ? 'text-gray-200' : 'text-gray-900'}`}>Why two actions?</p>
                      <p className={group.riskColor === 'black' ? 'text-gray-300' : 'text-gray-700'}>{group.explanation}</p>
                    </div>
                  )}

                  {group.physicalWork && (
                    <div className={`mt-3 p-2 ${group.riskColor === 'black' ? 'bg-gray-800' : 'bg-white'} rounded text-xs`}>
                      <p className={`font-semibold ${group.riskColor === 'black' ? 'text-gray-200' : 'text-gray-900'}`}>Physical work:</p>
                      <p className={group.riskColor === 'black' ? 'text-gray-300' : 'text-gray-700'}>{group.physicalWork}</p>
                    </div>
                  )}

                  {group.note2 && (
                    <div className={`mt-3 p-2 ${group.riskColor === 'black' ? 'bg-gray-800' : 'bg-blue-50'} rounded text-xs border-l-2 border-blue-500`}>
                      <p className={`italic ${group.riskColor === 'black' ? 'text-gray-300' : 'text-blue-900'}`}>{group.note2}</p>
                      {group.note3 && <p className={`italic mt-1 ${group.riskColor === 'black' ? 'text-gray-300' : 'text-blue-900'}`}>{group.note3}</p>}
                    </div>
                  )}

                  {group.consequence && (
                    <div className="mt-3 p-3 bg-red-100 border-l-4 border-red-600 rounded text-xs">
                      <p className="font-bold text-red-900">CONSEQUENCE:</p>
                      <p className="text-red-800">{group.consequence}</p>
                    </div>
                  )}

                  {group.bocRequirements && (
                    <div className={`mt-3 space-y-1 ${group.riskColor === 'black' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {group.bocRequirements.map((req, idx) => (
                        <div key={idx} className={`text-xs p-2 ${group.riskColor === 'black' ? 'bg-gray-800' : 'bg-white'} rounded border ${group.riskColor === 'black' ? 'border-gray-700' : 'border-gray-300'}`}>
                          <span className="font-bold">{req.year}</span> {req.requirement}
                        </div>
                      ))}
                    </div>
                  )}

                  {group.macrNote && (
                    <p className={`text-xs mt-2 ${group.riskColor === 'black' ? 'text-gray-400' : 'text-gray-600'}`}>• {group.macrNote}</p>
                  )}

                  {group.equipmentChallenge && (
                    <div className="mt-3 p-3 bg-amber-100 border-l-4 border-amber-600 rounded text-xs">
                      <p className="font-bold text-amber-900">EQUIPMENT CHALLENGE:</p>
                      <p className="text-amber-800">{group.equipmentChallenge}</p>
                    </div>
                  )}
                </div>

                {/* Outcomes */}
                <div>
                  <h5 className={`font-bold mb-3 ${group.riskColor === 'black' ? 'text-white' : 'text-gray-900'}`}>Outcomes</h5>
                  <div className="space-y-2">
                    {group.outcomes.map((outcome, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        {typeof outcome === 'string' ? (
                          <>
                            <span className={group.riskColor === 'black' ? 'text-green-400' : 'text-green-600'}>✓</span>
                            <p className={`text-sm ${group.riskColor === 'black' ? 'text-gray-200' : 'text-gray-700'}`}>{outcome}</p>
                          </>
                        ) : (
                          <>
                            <span className={outcome.success ? (group.riskColor === 'black' ? 'text-green-400' : 'text-green-600') : outcome.danger ? 'text-red-600' : 'text-amber-600'}>
                              {outcome.success ? '✓' : outcome.danger ? '✗' : '△'}
                            </span>
                            <p className={`text-sm ${outcome.success ? (group.riskColor === 'black' ? 'text-gray-200' : 'text-gray-700') : outcome.danger ? 'text-red-700' : 'text-amber-700'} ${outcome.danger || outcome.warning ? 'font-semibold' : ''}`}>
                              {outcome.text}
                            </p>
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className={`mt-4 p-3 ${group.riskColor === 'green' ? 'bg-green-100 border-green-300' : group.riskColor === 'red' ? 'bg-red-100 border-red-300' : 'bg-gray-800 border-gray-700'} border-2 rounded`}>
                    <p className={`font-bold text-sm ${group.riskColor === 'green' ? 'text-green-900' : group.riskColor === 'red' ? 'text-red-900' : 'text-white'}`}>
                      {group.summary}
                    </p>
                    {group.summary2 && (
                      <p className={`text-sm mt-1 ${group.riskColor === 'black' ? 'text-gray-300' : 'text-gray-800'}`}>{group.summary2}</p>
                    )}
                  </div>
                </div>

                {/* Risk Level */}
                <div>
                  <div className={`p-4 rounded-lg ${group.riskColor === 'green' ? 'bg-white border-2 border-green-600' : group.riskColor === 'red' ? 'bg-black text-white' : 'bg-black text-white'} text-center`}>
                    <h5 className={`font-bold text-lg ${group.riskColor === 'green' ? 'text-green-900' : 'text-white'}`}>{group.riskLevel}</h5>
                  </div>

                  <div className="mt-4">
                    {typeof group.riskDetails === 'string' ? (
                      <p className={`text-xs ${group.riskColor === 'black' ? 'text-gray-300' : 'text-gray-600'}`}>{group.riskDetails}</p>
                    ) : (
                      <>
                        <p className={`text-xs font-bold mb-2 ${group.riskColor === 'black' ? 'text-white' : 'text-gray-900'}`}>{group.riskDetails[0]}</p>
                        <ul className="space-y-1">
                          {group.riskDetails.slice(1).map((detail, idx) => (
                            <li key={idx} className={`text-xs ${group.riskColor === 'black' ? 'text-gray-300' : 'text-gray-600'}`}>• {detail}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
          <h4 className="font-bold text-blue-900 mb-2">Portfolio Classification Tool</h4>
          <p className="text-sm text-blue-800 mb-4">
            Use the Calculator tab to analyze individual projects and automatically assign them to the appropriate group based on capacity, timing, and feasibility assessments.
          </p>
          <button
            onClick={() => setActiveTab('calculator')}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
          >
            Go to Calculator
          </button>
        </div>
      </div>
    );
  };

  // Dashboard Component
  const Dashboard = () => {
    const totalProjects = projects.length;
    const qualifiedProjects = projects.filter(p => {
      const percentage = calculateSafeHarborPercentage(p.allocatedCost, p.totalCost);
      return parseFloat(percentage) >= 5.0;
    }).length;
    const totalInvested = projects.reduce((sum, p) => sum + p.allocatedCost, 0);

    const feocEligible = projects.filter(p => {
      const track = determineBOCTrack(p.capacity, p.paymentDate);
      return track.eligible && new Date(p.paymentDate) <= new Date('2025-12-31');
    }).length;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Projects</p>
                <p className="text-3xl font-bold text-blue-900">{totalProjects}</p>
              </div>
              <Zap className="text-blue-500" size={32} />
            </div>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">5% Qualified</p>
                <p className="text-3xl font-bold text-green-900">{qualifiedProjects}</p>
              </div>
              <CheckCircle className="text-green-500" size={32} />
            </div>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">FEOC Eligible</p>
                <p className="text-3xl font-bold text-purple-900">{feocEligible}</p>
              </div>
              <Calendar className="text-purple-500" size={32} />
            </div>
          </div>

          <div className="bg-amber-50 p-6 rounded-lg border-2 border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600 font-medium">Total Invested</p>
                <p className="text-2xl font-bold text-amber-900">${(totalInvested / 1000000).toFixed(1)}M</p>
              </div>
              <DollarSign className="text-amber-500" size={32} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Critical Deadlines</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded border border-red-200">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-red-600" size={20} />
                <div>
                  <p className="font-semibold text-red-900">FEOC Exemption Deadline</p>
                  <p className="text-sm text-red-700">Construction must begin by this date for permanent FEOC exemption</p>
                </div>
              </div>
              <span className="font-bold text-red-900">Dec 31, 2025</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 rounded border border-orange-200">
              <div className="flex items-center gap-3">
                <Calendar className="text-orange-600" size={20} />
                <div>
                  <p className="font-semibold text-orange-900">ITC/PTC Safe Harbor (≤1.5MW)</p>
                  <p className="text-sm text-orange-700">Last day for 5% safe harbor on small projects</p>
                </div>
              </div>
              <span className="font-bold text-orange-900">July 4, 2026</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded border border-blue-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-blue-600" size={20} />
                <div>
                  <p className="font-semibold text-blue-900">4-Year Continuity Safe Harbor</p>
                  <p className="text-sm text-blue-700">Projects qualifying in 2025 must be PIS by Dec 31, 2029</p>
                </div>
              </div>
              <span className="font-bold text-blue-900">Dec 31, 2029</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Projects Overview</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Project</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Capacity</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Group</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Safe Harbor %</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ITC Rate</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">BOC Track</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {projects.map(project => {
                  const percentage = parseFloat(calculateSafeHarborPercentage(project.allocatedCost, project.totalCost));
                  const track = determineBOCTrack(project.capacity, project.paymentDate);
                  const qualified = percentage >= 5.0;

                  // Calculate ITC rate
                  const calculateITCRateForProject = (p) => {
                    if (!p?.itcCompliance) return 6;
                    let rate = 6;
                    if (p.itcCompliance.prevailingWage && p.itcCompliance.apprenticeship) rate = 30;
                    if (p.itcCompliance.domesticContent) rate += 10;
                    if (p.itcCompliance.energyCommunity) rate += 10;
                    return rate;
                  };

                  const itcRate = calculateITCRateForProject(project);

                  const getGroupBadge = (groupId) => {
                    if (!groupId) return <span className="text-xs text-gray-400">Unassigned</span>;
                    const colors = {
                      1: 'bg-green-100 text-green-800 border-green-300',
                      2: 'bg-green-100 text-green-800 border-green-300',
                      3: 'bg-red-100 text-red-800 border-red-300',
                      4: 'bg-gray-800 text-white border-gray-900'
                    };
                    return (
                      <span className={`px-2 py-1 text-xs font-semibold rounded border ${colors[groupId]}`}>
                        Group {groupId}
                      </span>
                    );
                  };

                  return (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{project.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{project.capacity} MW</td>
                      <td className="px-4 py-3">{getGroupBadge(project.group)}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`font-semibold ${qualified ? 'text-green-600' : 'text-red-600'}`}>
                          {percentage.toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`font-bold ${itcRate >= 40 ? 'text-green-600' : itcRate >= 30 ? 'text-blue-600' : 'text-amber-600'}`}>
                          {itcRate}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{track.track}</td>
                      <td className="px-4 py-3">
                        {qualified ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">Qualified</span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">Below 5%</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => {
                            setSelectedProject(project);
                            setActiveTab('calculator');
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Calculator Component
  const Calculator = () => {
    const [projectData, setProjectData] = useState(selectedProject || {
      name: '',
      capacity: 0,
      location: '',
      totalCost: 0,
      allocatedCost: 0,
      paymentDate: new Date().toISOString().split('T')[0],
      interconnectionStatus: '',
      siteControl: false,
      permits: '',
      estimatedPIS: '',
      physicalWorkBy726: false
    });

    const percentage = calculateSafeHarborPercentage(projectData.allocatedCost, projectData.totalCost);
    const track = determineBOCTrack(projectData.capacity, projectData.paymentDate);
    const deliveryDeadline = calculate105DayDeadline(projectData.paymentDate);
    const pisDeadline = calculatePISDeadline(projectData.paymentDate);
    const qualified = parseFloat(percentage) >= 5.0;

    // Determine which group the project belongs to
    const determineGroup = () => {
      const paymentDate = new Date(projectData.paymentDate);
      const dec31_2025 = new Date('2025-12-31');
      const july4_2026 = new Date('2026-07-04');
      
      // Group 4: No safe harbor in 2025
      if (paymentDate > dec31_2025) {
        return {
          id: 4,
          name: "GROUP 4",
          description: "Construction Start 2026/2027 - NO Safe Harbor",
          reason: "Payment date after Dec 31, 2025 - cannot qualify for FEOC exemption"
        };
      }
      
      // Group 1: Small projects with safe harbor
      if (projectData.capacity <= 1.5 && paymentDate <= dec31_2025) {
        return {
          id: 1,
          name: "GROUP 1",
          description: "≤1.5 MW AC - Safe Harbor in 2025",
          reason: "Small project can use 5% safe harbor for both FEOC and ITC/PTC"
        };
      }
      
      // Large projects (>1.5 MW)
      if (projectData.capacity > 1.5 && paymentDate <= dec31_2025) {
        // Group 2: Can do physical work by 7/4/26
        if (projectData.physicalWorkBy726) {
          return {
            id: 2,
            name: "GROUP 2",
            description: "> 1.5 MW AC - Safe Harbor + Physical Work",
            reason: "Can achieve both FEOC exemption (5% safe harbor) and ITC/PTC BOC (physical work by 7/4/26)"
          };
        } else {
          // Group 3: Cannot do physical work by 7/4/26
          return {
            id: 3,
            name: "GROUP 3",
            description: "> 1.5 MW AC - Safe Harbor Only (High Risk)",
            reason: "Can only achieve FEOC exemption. ITC/PTC BOC at risk due to inability to complete physical work by 7/4/26"
          };
        }
      }
      
      return null;
    };

    const projectGroup = determineGroup();

    const handleCalculate = () => {
      if (!selectedProject) {
        const newProject = {
          ...projectData,
          id: projects.length + 1,
          group: projectGroup?.id,
          itcCompliance: {
            bocQualified: parseFloat(percentage) >= 5.0,
            prevailingWage: false,
            apprenticeship: false,
            domesticContent: false,
            domesticContentPercentage: 0,
            energyCommunity: false,
            laborStandardsRegistered: false,
            continuousConstruction: true
          }
        };
        setProjects([...projects, newProject]);
        alert(`Project added successfully and assigned to ${projectGroup?.name}! Configure ITC compliance in the ITC Compliance tab.`);
      }
    };

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Safe Harbor Calculator & Group Assignment</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Project Name</label>
              <input
                type="text"
                value={projectData.name}
                onChange={(e) => setProjectData({...projectData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., Project Sunrise"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Capacity (MW AC)</label>
              <input
                type="number"
                step="0.1"
                value={projectData.capacity}
                onChange={(e) => setProjectData({...projectData, capacity: parseFloat(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Estimated Total Project Cost ($)</label>
              <input
                type="number"
                value={projectData.totalCost}
                onChange={(e) => setProjectData({...projectData, totalCost: parseFloat(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="8000000"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Equipment Cost Allocated ($)</label>
              <input
                type="number"
                value={projectData.allocatedCost}
                onChange={(e) => setProjectData({...projectData, allocatedCost: parseFloat(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="520000"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Date</label>
              <input
                type="date"
                value={projectData.paymentDate}
                onChange={(e) => setProjectData({...projectData, paymentDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={projectData.location}
                onChange={(e) => setProjectData({...projectData, location: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Texas"
              />
            </div>

            {projectData.capacity > 1.5 && new Date(projectData.paymentDate) <= new Date('2025-12-31') && (
              <div className="md:col-span-2">
                <label className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg border-2 border-amber-300 cursor-pointer hover:bg-amber-100">
                  <input
                    type="checkbox"
                    checked={projectData.physicalWorkBy726}
                    onChange={(e) => setProjectData({...projectData, physicalWorkBy726: e.target.checked})}
                    className="w-5 h-5"
                  />
                  <div>
                    <p className="font-semibold text-amber-900">Can complete physical work by July 4, 2026?</p>
                    <p className="text-sm text-amber-700">Foundation excavation, anchor bolts, concrete pads, racking installation</p>
                  </div>
                </label>
              </div>
            )}
          </div>

          {!selectedProject && (
            <button
              onClick={handleCalculate}
              className="mt-6 px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
            >
              Add Project & Assign Group
            </button>
          )}
        </div>

        {projectGroup && (
          <div className={`bg-white p-6 rounded-lg shadow-md border-2 ${
            projectGroup.id === 1 ? 'border-green-500' :
            projectGroup.id === 2 ? 'border-green-500' :
            projectGroup.id === 3 ? 'border-red-500' :
            'border-gray-900'
          }`}>
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${
                projectGroup.id === 1 || projectGroup.id === 2 ? 'bg-green-100' :
                projectGroup.id === 3 ? 'bg-red-100' :
                'bg-gray-900 text-white'
              }`}>
                <AlertCircle size={32} className={
                  projectGroup.id === 1 || projectGroup.id === 2 ? 'text-green-600' :
                  projectGroup.id === 3 ? 'text-red-600' :
                  'text-white'
                } />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-gray-900">Project Classification: {projectGroup.name}</h4>
                <p className="text-gray-700 mt-1">{projectGroup.description}</p>
                <p className="text-sm text-gray-600 mt-2"><span className="font-semibold">Reason:</span> {projectGroup.reason}</p>
                <button
                  onClick={() => setActiveTab('portfolio')}
                  className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-semibold"
                >
                  View {projectGroup.name} Details in Portfolio Strategy →
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Results</h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Safe Harbor Percentage</span>
                <span className={`text-2xl font-bold ${qualified ? 'text-green-600' : 'text-red-600'}`}>
                  {percentage}%
                </span>
              </div>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${qualified ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{width: `${Math.min(parseFloat(percentage), 100)}%`}}
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {qualified ? '✓ Exceeds 5% minimum requirement' : '✗ Below 5% minimum requirement'}
              </p>
            </div>

            <div className={`p-4 rounded-lg border-2 ${track.eligible ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-start gap-3">
                {track.eligible ? (
                  <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
                ) : (
                  <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
                )}
                <div>
                  <p className="font-semibold text-gray-900">BOC Qualification Track</p>
                  <p className={`text-sm mt-1 ${track.eligible ? 'text-green-800' : 'text-red-800'}`}>
                    {track.track}
                  </p>
                  {track.details && (
                    <p className="text-xs text-gray-600 mt-2">{track.details}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-900">105-Day Delivery Deadline</p>
                <p className="text-lg font-bold text-blue-700 mt-1">{deliveryDeadline}</p>
                <p className="text-xs text-blue-600 mt-1">Economic performance requirement for accrual-basis taxpayers</p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm font-medium text-purple-900">4-Year Continuity Deadline</p>
                <p className="text-lg font-bold text-purple-700 mt-1">{pisDeadline}</p>
                <p className="text-xs text-purple-600 mt-1">Placed-in-service deadline to maintain safe harbor</p>
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h4 className="font-semibold text-amber-900 mb-2">Recommended Safe Harbor Amount</h4>
              <p className="text-sm text-amber-800">
                To maintain audit defense margin, target: <span className="font-bold">${((projectData.totalCost * 0.065).toLocaleString())}</span> (6.5% of total cost)
              </p>
              <p className="text-xs text-amber-700 mt-1">Current allocation: ${projectData.allocatedCost.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Contract Generator Component
  const ContractGenerator = () => {
    const [contractData, setContractData] = useState({
      vendorName: 'ABC Solar Supply',
      buyerName: 'Trail Ridge Power LLC',
      equipment: 'Solar photovoltaic modules and inverters',
      quantity: '1,500 modules (550W each), 30 string inverters',
      totalPrice: 2500000,
      deliveryDate: '2026-03-15',
      projectName: 'Project Sunrise 5MW',
      projectLocation: 'Texas',
      paymentTerms: '50% deposit upon execution, 50% upon delivery'
    });

    const [generatedContract, setGeneratedContract] = useState('');

    const generateContract = () => {
      const liquidatedDamages = (contractData.totalPrice * 0.05).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
      const contract = `
BINDING WRITTEN CONTRACT FOR EQUIPMENT PURCHASE
IRS Notice 2013-29 Compliant

Contract Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
Contract Number: SH-${Date.now()}

PARTIES:
Seller: ${contractData.vendorName}
Buyer: ${contractData.buyerName}

PROJECT ALLOCATION:
This equipment is allocated to: ${contractData.projectName}
Project Location: ${contractData.projectLocation}

EQUIPMENT SPECIFICATIONS:
${contractData.equipment}
Quantity: ${contractData.quantity}

TOTAL CONTRACT PRICE: ${contractData.totalPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}

PAYMENT TERMS:
${contractData.paymentTerms}

DELIVERY SCHEDULE:
Delivery Date: ${new Date(contractData.deliveryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

REASONABLE DELIVERY EXPECTATION (105-Day Rule):
Seller represents and Buyer reasonably expects that delivery will occur within 105 days of payment. This expectation is based on Seller's current manufacturing schedule, shipping capacity, and absence of known supply chain disruptions as of the contract date.

LIQUIDATED DAMAGES PROVISION:
In the event Seller fails to deliver the equipment in accordance with the terms of this contract, Seller shall pay Buyer liquidated damages in the amount of ${liquidatedDamages}, which represents five percent (5%) of the total contract price. This provision is enforceable under applicable state law and is intended to satisfy the requirements of IRS Notice 2013-29 for establishing a binding written contract for Beginning of Construction purposes under IRC §48.

TITLE AND RISK OF LOSS:
Title to the equipment shall pass to Buyer upon [SPECIFY: delivery at project site / payment / other].
Risk of loss shall transfer to Buyer upon [SPECIFY: delivery at project site / payment / other].

ECONOMIC PERFORMANCE:
For purposes of IRC §461 and Treasury Regulation §1.461-4(d)(6)(ii), the parties acknowledge that economic performance occurs when the property is provided to the Buyer. If Buyer is an accrual-basis taxpayer making payment prior to delivery, Buyer may treat the property as provided when payment is made if Buyer reasonably expects delivery within 3.5 months (105 days) after payment, as documented in this contract.

GOVERNING LAW:
This contract shall be governed by the laws of [SPECIFY STATE].

ENTIRE AGREEMENT:
This contract constitutes the entire agreement between the parties and supersedes all prior negotiations, representations, or agreements.

SIGNATURES:
(To be executed by authorized representatives)

_________________________          _________________________
${contractData.vendorName}                ${contractData.buyerName}
Date: _______________              Date: _______________
      `.trim();

      setGeneratedContract(contract);
    };

    const downloadContract = () => {
      const element = document.createElement('a');
      const file = new Blob([generatedContract], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `safe-harbor-contract-${Date.now()}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    };

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">IRS-Compliant Contract Generator</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Vendor Name</label>
              <input
                type="text"
                value={contractData.vendorName}
                onChange={(e) => setContractData({...contractData, vendorName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Buyer Name</label>
              <input
                type="text"
                value={contractData.buyerName}
                onChange={(e) => setContractData({...contractData, buyerName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Equipment Description</label>
              <input
                type="text"
                value={contractData.equipment}
                onChange={(e) => setContractData({...contractData, equipment: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
              <input
                type="text"
                value={contractData.quantity}
                onChange={(e) => setContractData({...contractData, quantity: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Total Price ($)</label>
              <input
                type="number"
                value={contractData.totalPrice}
                onChange={(e) => setContractData({...contractData, totalPrice: parseFloat(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Date</label>
              <input
                type="date"
                value={contractData.deliveryDate}
                onChange={(e) => setContractData({...contractData, deliveryDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Project Name</label>
              <input
                type="text"
                value={contractData.projectName}
                onChange={(e) => setContractData({...contractData, projectName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Project Location</label>
              <input
                type="text"
                value={contractData.projectLocation}
                onChange={(e) => setContractData({...contractData, projectLocation: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <button
            onClick={generateContract}
            className="mt-6 px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 flex items-center gap-2"
          >
            <FileText size={20} />
            Generate Contract
          </button>
        </div>

        {generatedContract && (
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Generated Contract</h3>
              <button
                onClick={downloadContract}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <Download size={16} />
                Download
              </button>
            </div>
            
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-semibold text-amber-900">Key Compliance Elements Included:</p>
                  <ul className="text-sm text-amber-800 mt-2 space-y-1">
                    <li>• 5% liquidated damages provision (${(contractData.totalPrice * 0.05).toLocaleString()})</li>
                    <li>• 105-day reasonable delivery expectation statement</li>
                    <li>• Project allocation documentation</li>
                    <li>• Economic performance clarification for IRC §461</li>
                    <li>• Enforceable under state law representation</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded border border-gray-300 max-h-96 overflow-y-auto">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                {generatedContract}
              </pre>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Guidance Component
  const Guidance = () => {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg shadow-md text-white">
          <h3 className="text-2xl font-bold mb-2">IRS Safe Harbor Compliance Guide</h3>
          <p className="text-blue-100">Critical requirements for Beginning of Construction qualification</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h4 className="text-lg font-bold text-gray-900 mb-4">Understanding the 5% Safe Harbor Test</h4>
          <div className="space-y-4 text-gray-700">
            <p>
              A facility's construction is deemed to have begun if the taxpayer pays or incurs (within the meaning of IRC §461) 
              five percent or more of the total cost of the facility, and thereafter makes continuous efforts to advance toward completion.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <p className="font-semibold text-blue-900 mb-2">Total Cost Definition:</p>
              <p className="text-sm">All costs properly included in depreciable basis under IRC §167. Excludes land acquisition and non-integral property.</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h4 className="text-lg font-bold text-gray-900 mb-4">The 105-Day Economic Performance Rule</h4>
          <div className="space-y-4 text-gray-700">
            <p>
              For accrual-basis taxpayers, Treasury Regulation §1.461-4(d)(6)(ii) allows property to be treated as provided 
              when payment is made IF the taxpayer can reasonably expect delivery within 3.5 months (105 days) after payment.
            </p>
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <p className="font-semibold text-green-900 mb-2">Example:</p>
              <p className="text-sm">
                Payment on December 15, 2025 → Economic performance satisfied if delivery reasonably expected by ~March 30, 2026.
                Unforeseen delays are accommodated if original expectation was reasonable.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h4 className="text-lg font-bold text-gray-900 mb-4">Dual-Track BOC Framework (Post-Notice 2025-42)</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h5 className="font-bold text-purple-900 mb-2">Track 1: ITC/PTC Continuation</h5>
              <ul className="text-sm text-purple-800 space-y-2">
                <li><strong>Projects &gt;1.5MW AC:</strong> 5% safe harbor ELIMINATED (effective 9/2/25), must use Physical Work Test</li>
                <li><strong>Projects ≤1.5MW AC:</strong> 5% safe harbor retained through July 4, 2026</li>
                <li><strong>Aggregation rules apply</strong> for small projects</li>
              </ul>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h5 className="font-bold text-orange-900 mb-2">Track 2: FEOC Exemption</h5>
              <ul className="text-sm text-orange-800 space-y-2">
                <li><strong>Key deadline:</strong> Construction must begin by Dec 31, 2025</li>
                <li><strong>Both tests available:</strong> Physical Work Test AND 5% safe harbor</li>
                <li><strong>Works for all sizes:</strong> Projects &gt;1.5MW can use 5% for FEOC only</li>
              </ul>
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
            <p className="font-semibold text-red-900 mb-2">Critical Insight:</p>
            <p className="text-sm text-red-800">
              Projects &gt;1.5MW can still use the 5% safe harbor for FEOC exemption purposes (by 12/31/25) even though 
              it's eliminated for ITC/PTC qualification. This creates strategic planning opportunities for large projects.
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h4 className="text-lg font-bold text-gray-900 mb-4">Required Contract Elements</h4>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <p className="font-semibold text-gray-900">Enforceable under local law</p>
                <p className="text-sm text-gray-600">Contract must be legally binding in applicable jurisdiction</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <p className="font-semibold text-gray-900">Liquidated damages ≥5% of contract price</p>
                <p className="text-sm text-gray-600">Essential for IRS Notice 2013-29 compliance</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <p className="font-semibold text-gray-900">Specific delivery timeline</p>
                <p className="text-sm text-gray-600">Document reasonable delivery expectations for 105-day rule</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <p className="font-semibold text-gray-900">Title transfer and risk of loss provisions</p>
                <p className="text-sm text-gray-600">Clear allocation of ownership and risk</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h4 className="text-lg font-bold text-gray-900 mb-4">Best Practices</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">1.</span>
              <p className="text-sm text-gray-700">Over-document contemporaneously</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">2.</span>
              <p className="text-sm text-gray-700">Exceed 5% minimum (aim for 6-7%)</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">3.</span>
              <p className="text-sm text-gray-700">Verify interconnection status first</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">4.</span>
              <p className="text-sm text-gray-700">Front-load contract review</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">5.</span>
              <p className="text-sm text-gray-700">Maintain single source of truth</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">6.</span>
              <p className="text-sm text-gray-700">Plan for cost true-ups</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="text-blue-600" size={36} />
            <h1 className="text-3xl font-bold text-gray-900">Safe Harbor Compliance System</h1>
          </div>
          <p className="text-gray-600">IRS-compliant documentation for renewable energy projects</p>
        </div>

        <div className="mb-6 bg-white rounded-lg shadow-md p-1 flex flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 min-w-[120px] px-3 py-3 rounded-md font-semibold transition-colors text-sm ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`flex-1 min-w-[120px] px-3 py-3 rounded-md font-semibold transition-colors text-sm ${
              activeTab === 'portfolio'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Portfolio Strategy
          </button>
          <button
            onClick={() => setActiveTab('itc')}
            className={`flex-1 min-w-[120px] px-3 py-3 rounded-md font-semibold transition-colors text-sm ${
              activeTab === 'itc'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            ITC Compliance
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex-1 min-w-[120px] px-3 py-3 rounded-md font-semibold transition-colors text-sm ${
              activeTab === 'calculator'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Calculator
          </button>
          <button
            onClick={() => setActiveTab('contract')}
            className={`flex-1 min-w-[120px] px-3 py-3 rounded-md font-semibold transition-colors text-sm ${
              activeTab === 'contract'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Contract Generator
          </button>
          <button
            onClick={() => setActiveTab('guidance')}
            className={`flex-1 min-w-[120px] px-3 py-3 rounded-md font-semibold transition-colors text-sm ${
              activeTab === 'guidance'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Guide
          </button>
        </div>

        <div>
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'portfolio' && <PortfolioStrategy />}
          {activeTab === 'itc' && <ITCCompliance />}
          {activeTab === 'calculator' && <Calculator />}
          {activeTab === 'contract' && <ContractGenerator />}
          {activeTab === 'guidance' && <Guidance />}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Based on Treasury Notices 2013-29, 2018-59, 2020-41, 2021-41, and 2025-42</p>
          <p className="mt-1">This system provides guidance only. Consult tax and legal professionals for specific situations.</p>
        </div>
      </div>
    </div>
  );
};

export default SafeHarborComplianceSystem;