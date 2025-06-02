import mongoose from 'mongoose';

const dropdownOptionsSchema = new mongoose.Schema({
    capability: {
        type: [String],
        default: ["Build (New capabilities)", "Maintain (Keep lights on)", "Retire (Eliminate capabilities)"]
    },
    pillar: {
        type: [String],
        default: ["Innovation", "Navigation of Healthcare Reform", "Organizational & Staff", "Participant Engagement", "Strategic Growth"]
    },
    executiveSponsor: {
        type: [String],
        default: ["Bulmahn, Wayne", "Sheridan, Sabrina", "Riley, Angela", "Krajcinovic, Ivana", "VandeVusse, Joel", "Patel, Dharma"]
    }
}, { timestamps: true });

const DropdownOptions = mongoose.models.DropdownOptions || mongoose.model('DropdownOptions', dropdownOptionsSchema);

export default DropdownOptions;