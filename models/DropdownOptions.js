import mongoose from 'mongoose';

const dropdownOptionsSchema = new mongoose.Schema({
  capability: { type: [String], default: ["Build (New capabilities)", "Maintain (Keep lights on)", "Retire (Eliminate capabilities)"] },
  pillar: { type: [String], default: ["Innovation", "Navigation of Healthcare Reform", "Organizational & Staff", "Participant Engagement", "Strategic Growth"] },
  executiveSponsor: { type: [String], default: ["Bulmahn, Wayne", "Sheridan, Sabrina", "Riley, Angela", "Krajcinovic, Ivana", "VandeVusse, Joel", "Patel, Dharma"] },
  departments: { 
    type: [String], 
    default: ["Claims", "Finance / Underwriting", "Healthcare Delivery", "Hospitality Rx", "HRT", "Human Resources", "Informatics", "Information Technology", "Legal", "LV: Advocacy/Comms", "LV: Hospitality", "LV: Network", "LV: NHS", "Medical Management", "New Membership / HIPAA", "Office Services", "Operations", "PMO"]
 }
}, { timestamps: true });

export default mongoose.models.DropdownOptions || mongoose.model('DropdownOptions', dropdownOptionsSchema);
