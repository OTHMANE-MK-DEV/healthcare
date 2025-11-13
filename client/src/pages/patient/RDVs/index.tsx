import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, FileText, AlertCircle, CheckCircle2, XCircle, Search, Filter } from 'lucide-react';

// UI Components (shadcn/ui style)
const Button = ({ children, onClick, variant = 'default', className = '', disabled = false }) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    default: 'bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 text-white',
    outline: 'border-2 border-slate-300 hover:bg-slate-50 text-slate-700',
    ghost: 'hover:bg-slate-100 text-slate-700'
  };
  
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-lg ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
    confirmed: 'bg-green-100 text-green-800 border-green-200',
    canceled: 'bg-red-100 text-red-800 border-red-200',
    completed: 'bg-slate-100 text-slate-800 border-slate-200'
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${variants[variant] || variants.scheduled}`}>
      {children}
    </span>
  );
};

// Types
interface Rdv {
  _id: string;
  idRdv: number;
  datetime: string;
  status: 'scheduled' | 'confirmed' | 'canceled' | 'completed';
  motif: string;
  medecin: {
    _id: string;
    nom: string;
    prenom: string;
    specialite: string;
    experience: number;
  };
  createdAt: string;
}

const PatientRDVsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Rdv[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Rdv[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Rdv | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch appointments
  useEffect(() => {
    fetchAppointments();
  }, []);

  // Filter appointments
  useEffect(() => {
    let filtered = [...appointments];

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(apt => apt.status === selectedStatus);
    }

    // Filter by search term
  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    filtered = filtered.filter(apt => {
      const prenom = apt.medecin?.prenom?.toLowerCase() || "";
      const nom = apt.medecin?.nom?.toLowerCase() || "";
      const specialite = apt.medecin?.specialite?.toLowerCase() || "";
      const motif = apt.motif?.toLowerCase() || "";

      return (
        `${prenom} ${nom}`.includes(searchLower) ||
        specialite.includes(searchLower) ||
        motif.includes(searchLower)
      );
    });
  }


    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());

    setFilteredAppointments(filtered);
  }, [appointments, selectedStatus, searchTerm]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      // Replace with your actual API endpoint
      const response = await fetch('http://localhost:5001/api/appointments', {
        credentials:"include",
      });

      if (!response.ok) throw new Error('Failed to fetch appointments');

      const data = await response.json();
        
      setAppointments(data.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      const response = await fetch(`http://localhost:5001/api/appointments/${appointmentId}/cancel`, {
        method: 'PATCH',
        credentials: "include",
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to cancel appointment');

      // Update local state
      setAppointments(prev => 
        prev.map(apt => 
          apt._id === appointmentId ? { ...apt, status: 'canceled' } : apt
        )
      );
      
      setShowDetails(false);
    } catch (err) {
      alert('Failed to cancel appointment. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'canceled':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-slate-600" />;
      default:
        return <Clock className="h-5 w-5 text-blue-600" />;
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const isUpcoming = (datetime: string) => {
    return new Date(datetime) > new Date();
  };

  const canCancel = (apt: Rdv) => {
    return isUpcoming(apt.datetime) && (apt.status === 'scheduled' || apt.status === 'confirmed');
  };

  const stats = {
    total: appointments.length,
    upcoming: appointments.filter(apt => isUpcoming(apt.datetime) && apt.status !== 'canceled').length,
    confirmed: appointments.filter(apt => apt.status === 'confirmed').length,
    completed: appointments.filter(apt => apt.status === 'completed').length
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full p-4 md:p-8 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full p-4 md:p-8 bg-slate-50">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
            My Appointments
          </h1>
          <p className="text-slate-600">
            View and manage your medical appointments
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total</p>
                <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
              </div>
              <Calendar className="h-8 w-8 text-lime-600" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Upcoming</p>
                <p className="text-2xl font-bold text-blue-600">{stats.upcoming}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Completed</p>
                <p className="text-2xl font-bold text-slate-600">{stats.completed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-slate-600" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by doctor name, specialty, or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-slate-600" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <Card className="p-12 text-center">
            <Calendar className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No Appointments Found</h3>
            <p className="text-slate-600">
              {searchTerm || selectedStatus !== 'all' 
                ? 'Try adjusting your filters' 
                : 'You have no appointments yet'}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((apt) => (
              <Card key={apt._id} className="p-6 hover:shadow-xl transition-shadow duration-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left Side - Main Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        {getStatusIcon(apt.status)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-800">
                            Dr. {apt.medecin.prenom} {apt.medecin.nom}
                          </h3>
                          <Badge variant={apt.status}>{getStatusText(apt.status)}</Badge>
                        </div>
                        
                        <p className="text-sm text-slate-600 mb-3">
                          {apt.medecin.specialite} • {apt.medecin.experience} years experience
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2 text-slate-700">
                            <Calendar className="h-4 w-4 text-lime-600" />
                            <span>{formatDate(apt.datetime)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-700">
                            <Clock className="h-4 w-4 text-lime-600" />
                            <span>{formatTime(apt.datetime)}</span>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex items-start gap-2 text-sm">
                          <FileText className="h-4 w-4 text-lime-600 mt-0.5 flex-shrink-0" />
                          <p className="text-slate-600 line-clamp-2">{apt.motif}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Actions */}
                  <div className="flex md:flex-col gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedAppointment(apt);
                        setShowDetails(true);
                      }}
                      className="flex-1 md:flex-none"
                    >
                      View Details
                    </Button>
                    
                    {canCancel(apt) && (
                      <Button
                        variant="outline"
                        onClick={() => handleCancelAppointment(apt._id)}
                        className="flex-1 md:flex-none text-red-600 border-red-300 hover:bg-red-50"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Details Modal */}
        {showDetails && selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">Appointment Details</h2>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Status Badge */}
                  <div className="flex items-center gap-3">
                    {getStatusIcon(selectedAppointment.status)}
                    <Badge variant={selectedAppointment.status}>
                      {getStatusText(selectedAppointment.status)}
                    </Badge>
                  </div>

                  {/* Doctor Info */}
                  <div className="p-4 bg-lime-50 border border-lime-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-5 w-5 text-lime-600" />
                      <h3 className="font-semibold text-slate-800">Doctor Information</h3>
                    </div>
                    <p className="text-lg font-semibold text-lime-800 mb-1">
                      Dr. {selectedAppointment.medecin.prenom} {selectedAppointment.medecin.nom}
                    </p>
                    <p className="text-sm text-lime-700">
                      {selectedAppointment.medecin.specialite} • {selectedAppointment.medecin.experience} years experience
                    </p>
                  </div>

                  {/* Appointment Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-5 w-5 text-slate-600" />
                        <span className="text-sm font-semibold text-slate-700">Date</span>
                      </div>
                      <p className="text-slate-800 font-medium">
                        {formatDate(selectedAppointment.datetime)}
                      </p>
                    </div>
                    
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-5 w-5 text-slate-600" />
                        <span className="text-sm font-semibold text-slate-700">Time</span>
                      </div>
                      <p className="text-slate-800 font-medium">
                        {formatTime(selectedAppointment.datetime)}
                      </p>
                    </div>
                  </div>

                  {/* Reason for Visit */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-slate-600" />
                      <span className="text-sm font-semibold text-slate-700">Reason for Visit</span>
                    </div>
                    <p className="text-slate-800 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                      {selectedAppointment.motif}
                    </p>
                  </div>

                  {/* Appointment ID */}
                  <div className="text-sm text-slate-600">
                    <span className="font-semibold">Appointment ID:</span> #{selectedAppointment.idRdv}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setShowDetails(false)}
                      className="flex-1"
                    >
                      Close
                    </Button>
                    
                    {canCancel(selectedAppointment) && (
                      <Button
                        onClick={() => handleCancelAppointment(selectedAppointment._id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      >
                        Cancel Appointment
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientRDVsPage;