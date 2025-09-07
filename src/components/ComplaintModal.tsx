import React, { useState } from 'react';
import { X, MessageSquare, User, Phone, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { shopkeeperService } from '../services/shopkeeperService';

interface Complaint {
  _id: string;
  userId: {
    name: string;
    email: string;
    contactNumber: string;
  };
  orderId?: string;
  subscriptionId?: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  resolvedAt?: string;
}

interface ComplaintModalProps {
  complaint: Complaint;
  isOpen: boolean;
  onClose: () => void;
  onResolve: (complaintId: string) => void;
}

const ComplaintModal: React.FC<ComplaintModalProps> = ({ 
  complaint, 
  isOpen, 
  onClose, 
  onResolve 
}) => {
  const [resolution, setResolution] = useState('');
  const [resolving, setResolving] = useState(false);

  if (!isOpen) return null;

  const handleResolve = async () => {
    if (!resolution.trim()) {
      alert('Please enter a resolution note');
      return;
    }

    setResolving(true);
    
    try {
      const response = await shopkeeperService.resolveComplaint(complaint._id, resolution);
      
      if (response.success) {
        onResolve(complaint._id);
        onClose();
        alert('Complaint resolved successfully!');
      } else {
        alert('Failed to resolve complaint. Please try again.');
      }
    } catch (error) {
      alert('Error resolving complaint. Please try again.');
    } finally {
      setResolving(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-red-600 bg-red-50';
      case 'in-progress': return 'text-yellow-600 bg-yellow-50';
      case 'resolved': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Complaint Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Complaint Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-gray-900">{complaint.subject}</h4>
              <div className="flex space-x-2">
                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(complaint.priority)}`}>
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {complaint.priority.toUpperCase()} PRIORITY
                </span>
                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(complaint.status)}`}>
                  {complaint.status === 'resolved' && <CheckCircle className="h-3 w-3 mr-1" />}
                  {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                </span>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed">{complaint.description}</p>
            </div>
          </div>

          {/* Customer Information */}
          <div className="mb-6">
            <h5 className="text-md font-semibold text-gray-900 mb-3">Customer Information</h5>
            <div className="bg-blue-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-gray-900">{complaint.userId.name}</span>
              </div>
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-4 w-4 text-blue-600" />
                <span className="text-gray-700">{complaint.userId.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-blue-600" />
                <span className="text-gray-700">{complaint.userId.contactNumber}</span>
              </div>
            </div>
          </div>

          {/* Complaint Timeline */}
          <div className="mb-6">
            <h5 className="text-md font-semibold text-gray-900 mb-3">Timeline</h5>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Complaint Submitted</p>
                  <p className="text-xs text-gray-500">
                    {new Date(complaint.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              
              {complaint.status === 'in-progress' && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Under Investigation</p>
                    <p className="text-xs text-gray-500">In progress</p>
                  </div>
                </div>
              )}
              
              {complaint.resolvedAt && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Complaint Resolved</p>
                    <p className="text-xs text-gray-500">
                      {new Date(complaint.resolvedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Resolution Section */}
          {complaint.status !== 'resolved' && (
            <div className="mb-6">
              <h5 className="text-md font-semibold text-gray-900 mb-3">Resolve Complaint</h5>
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Enter resolution details and actions taken..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            {complaint.status !== 'resolved' && (
              <button
                onClick={handleResolve}
                disabled={resolving || !resolution.trim()}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {resolving ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Resolving...
                  </div>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 inline mr-2" />
                    Mark as Resolved
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintModal;