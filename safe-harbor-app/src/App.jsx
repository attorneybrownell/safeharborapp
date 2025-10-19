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
      estimatedPIS: "2028-06-30"
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
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Safe Harbor %</th>
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

                  return (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{project.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{project.capacity} MW</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`font-semibold ${qualified ? 'text-green-600' : 'text-red-600'}`}>
                          {percentage.toFixed(2)}%
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
      estimatedPIS: ''
    });

    const percentage = calculateSafeHarborPercentage(projectData.allocatedCost, projectData.totalCost);
    const track = determineBOCTrack(projectData.capacity, projectData.paymentDate);
    const deliveryDeadline = calculate105DayDeadline(projectData.paymentDate);
    const pisDeadline = calculatePISDeadline(projectData.paymentDate);
    const qualified = parseFloat(percentage) >= 5.0;

    const handleCalculate = () => {
      if (!selectedProject) {
        const newProject = {
          ...projectData,
          id: projects.length + 1
        };
        setProjects([...projects, newProject]);
        alert('Project added successfully!');
      }
    };

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Safe Harbor Calculator</h3>
          
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
          </div>

          {!selectedProject && (
            <button
              onClick={handleCalculate}
              className="mt-6 px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
            >
              Add Project
            </button>
          )}
        </div>

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

        <div className="mb-6 bg-white rounded-lg shadow-md p-1 flex gap-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 px-4 py-3 rounded-md font-semibold transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex-1 px-4 py-3 rounded-md font-semibold transition-colors ${
              activeTab === 'calculator'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Calculator
          </button>
          <button
            onClick={() => setActiveTab('contract')}
            className={`flex-1 px-4 py-3 rounded-md font-semibold transition-colors ${
              activeTab === 'contract'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Contract Generator
          </button>
          <button
            onClick={() => setActiveTab('guidance')}
            className={`flex-1 px-4 py-3 rounded-md font-semibold transition-colors ${
              activeTab === 'guidance'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Compliance Guide
          </button>
        </div>

        <div>
          {activeTab === 'dashboard' && <Dashboard />}
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