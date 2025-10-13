import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Clock, Plus, Edit2, Trash2, CheckCircle2, XCircle, AlertCircle, ChevronLeft, ChevronRight, User, Filter } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const API_BASE_URL = 'http://localhost:5001/api';

export default function DoctorPlanning() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [view, setView] = useState('calendar');
  const [showSlotDialog, setShowSlotDialog] = useState(false);
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [slots, setSlots] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [doctor, setDoctor] = useState(null);
  
  // Slot creation/editing state
  const [slotForm, setSlotForm] = useState({
    mode: 'create',
    selectedSlot: null,
    date: '',
    startTime: '09:00',
    endTime: '17:00',
    duration: 30,
    slots: []
  });

  const today = new Date();

  const doctorId = JSON.parse(localStorage.getItem('profile')).id;

  // Fetch doctor data (you might get this from auth context or props)
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        // In a real app, you'd get the doctor ID from auth context
        const response = await fetch(`${API_BASE_URL}/doctors/${doctorId}`);
        if (response.ok) {
          const doctorData = await response.json();
          setDoctor(doctorData);
        }
      } catch (error) {
        console.error('Error fetching doctor:', error);
      }
    };

    fetchDoctor();
  }, []);

  // Fetch slots for current month
  useEffect(() => {
    const fetchSlots = async () => {
      if (!doctor) return;
      
      try {
        setLoading(true);
        const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
        
        const response = await fetch(
          `${API_BASE_URL}/available-slots/doctor/${doctor._id}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
        );
        
        if (response.ok) {
          const slotsData = await response.json();
          setSlots(slotsData);
        }
      } catch (error) {
        console.error('Error fetching slots:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [currentMonth, doctor]);

  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!doctor) return;
      
      try {
        const response = await fetch(
          `${API_BASE_URL}/appointments/doctor/${doctor._id}?status=${filterStatus === 'all' ? '' : filterStatus}`
        );
        
        if (response.ok) {
          const appointmentsData = await response.json();
          setAppointments(appointmentsData);
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };

    fetchAppointments();
  }, [doctor, filterStatus]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const isDatePast = (date) => {
    return date < today && formatDate(date) !== formatDate(today);
  };

  const getSlotsForDate = (date) => {
    return slots.filter(slot => 
      formatDate(new Date(slot.datetime)) === formatDate(date)
    );
  };

  const getAppointmentsForDate = (date) => {
    return appointments.filter(apt => 
      formatDate(new Date(apt.datetime)) === formatDate(date)
    );
  };

  const days = useMemo(() => getDaysInMonth(currentMonth), [currentMonth]);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateClick = (date) => {
    if (isDatePast(date)) return;
    setSelectedDate(date);
  };

  const handleCreateSlots = () => {
    setSlotForm({
      mode: 'create',
      selectedSlot: null,
      date: selectedDate ? formatDate(selectedDate) : '',
      startTime: '09:00',
      endTime: '17:00',
      duration: 30,
      slots: []
    });
    setShowSlotDialog(true);
  };

  const generateTimeSlots = () => {
    const { startTime, endTime, duration } = slotForm;
    const slots = [];
    
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    let currentTime = startHour * 60 + startMin;
    const endTimeMin = endHour * 60 + endMin;
    
    while (currentTime < endTimeMin) {
      const hour = Math.floor(currentTime / 60);
      const min = currentTime % 60;
      slots.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
      currentTime += duration;
    }
    
    setSlotForm({ ...slotForm, slots });
  };

  const handleSaveSlots = async () => {
    if (!doctor) return;
    
    try {
      const slotsToCreate = slotForm.slots.map(time => {
        const [hour, min] = time.split(':').map(Number);
        const datetime = new Date(slotForm.date);
        datetime.setHours(hour, min, 0, 0);
        
        return {
          datetime: datetime.toISOString(),
          duration: slotForm.duration
        };
      });

      const response = await fetch(`${API_BASE_URL}/available-slots/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          medecinId: doctor._id,
          slots: slotsToCreate
        })
      });

      if (response.ok) {
        const newSlots = await response.json();
        setSlots(prev => [...prev, ...newSlots]);
        setShowSlotDialog(false);
        setSlotForm({ mode: 'create', selectedSlot: null, date: '', startTime: '09:00', endTime: '17:00', duration: 30, slots: [] });
      } else {
        console.error('Failed to create slots');
      }
    } catch (error) {
      console.error('Error creating slots:', error);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!confirm('Are you sure you want to delete this slot?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/available-slots/${slotId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSlots(prev => prev.filter(s => s._id !== slotId));
      } else {
        console.error('Failed to delete slot');
      }
    } catch (error) {
      console.error('Error deleting slot:', error);
    }
  };

  const handleAppointmentAction = async (appointmentId, action) => {
    try {
      const newStatus = action === 'confirm' ? 'confirmed' : 'canceled';
      
      const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const updatedAppointment = await response.json();
        setAppointments(prev => 
          prev.map(apt => apt._id === appointmentId ? updatedAppointment : apt)
        );
        setShowAppointmentDialog(false);
        setSelectedAppointment(null);
      } else {
        console.error('Failed to update appointment');
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const filteredAppointments = useMemo(() => {
    if (filterStatus === 'all') return appointments;
    return appointments.filter(apt => apt.status === filterStatus);
  }, [appointments, filterStatus]);

  const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  if (!doctor) {
    return (
      <div className="min-h-full w-full p-8 bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading doctor information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full w-full p-2 md:p-8 overflow-x-hidden bg-slate-50">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
            Doctor Planning Dashboard
          </h1>
          <p className="text-slate-600">
            Welcome, Dr. {doctor.prenom} {doctor.nom} - {doctor.specialite}
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setView('calendar')}
            variant={view === 'calendar' ? 'default' : 'outline'}
            className={view === 'calendar' ? 'bg-lime-600 hover:bg-lime-700' : ''}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Calendar View
          </Button>
          <Button
            onClick={() => setView('appointments')}
            variant={view === 'appointments' ? 'default' : 'outline'}
            className={view === 'appointments' ? 'bg-lime-600 hover:bg-lime-700' : ''}
          >
            <User className="h-4 w-4 mr-2" />
            Appointments
          </Button>
        </div>

        {loading && (
          <div className="flex justify-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-600"></div>
          </div>
        )}

        {/* Calendar View */}
        {view === 'calendar' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePrevMonth}
                    className="h-10 w-10 rounded-full"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-lime-600" />
                    <h2 className="text-xl font-semibold text-slate-800">{monthYear}</h2>
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNextMonth}
                    className="h-10 w-10 rounded-full"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-lime-500 rounded"></div>
                    <span className="text-sm text-slate-600">Available Slots</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className="text-sm text-slate-600">Booked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-slate-200 rounded"></div>
                    <span className="text-sm text-slate-600">No Slots</span>
                  </div>
                </div>

                {/* Days of Week */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-sm font-semibold text-slate-600 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {days.map((day, index) => {
                    if (!day) {
                      return <div key={`empty-${index}`} className="aspect-square" />;
                    }

                    const isPast = isDatePast(day);
                    const daySlots = getSlotsForDate(day);
                    const bookedCount = daySlots.filter(s => s.isBooked).length;
                    const availableCount = daySlots.filter(s => !s.isBooked).length;
                    const isSelected = selectedDate && formatDate(selectedDate) === formatDate(day);

                    let buttonClasses = 'w-full aspect-square rounded-xl font-medium transition-all duration-200 ';
                    
                    if (isPast) {
                      buttonClasses += 'bg-slate-100 text-slate-400 cursor-not-allowed';
                    } else if (isSelected) {
                      buttonClasses += 'bg-lime-600 text-white shadow-lg scale-105 ring-2 ring-lime-300';
                    } else if (daySlots.length === 0) {
                      buttonClasses += 'bg-slate-200 text-slate-500 hover:bg-slate-300 cursor-pointer';
                    } else {
                      buttonClasses += 'bg-gradient-to-br from-lime-500 to-lime-600 text-white hover:shadow-md hover:scale-105 cursor-pointer';
                    }

                    return (
                      <button
                        key={index}
                        onClick={() => handleDateClick(day)}
                        disabled={isPast}
                        className={buttonClasses}
                      >
                        <div className="flex flex-col items-center justify-center h-full">
                          <span className="text-lg">{day.getDate()}</span>
                          {!isPast && daySlots.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {availableCount > 0 && (
                                <span className="text-xs bg-white/30 px-1.5 py-0.5 rounded">
                                  {availableCount}
                                </span>
                              )}
                              {bookedCount > 0 && (
                                <span className="text-xs bg-blue-500 px-1.5 py-0.5 rounded">
                                  {bookedCount}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Selected Date Details */}
            <div className="lg:col-span-1">
              {selectedDate ? (
                <div className="bg-white rounded-2xl shadow-lg p-6 max-h-[650px] overflow-y-auto">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-slate-800 mb-1">
                      {selectedDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </h3>
                    <Button
                      onClick={handleCreateSlots}
                      className="w-full mt-3 bg-lime-600 hover:bg-lime-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Time Slots
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">Available Slots</h4>
                    {getSlotsForDate(selectedDate).length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-4">
                        No slots created for this date
                      </p>
                    ) : (
                      getSlotsForDate(selectedDate)
                        .sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
                        .map(slot => (
                          <div
                            key={slot._id}
                            className={`p-3 rounded-lg border ${
                              slot.isBooked 
                                ? 'bg-blue-50 border-blue-200' 
                                : 'bg-lime-50 border-lime-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-slate-600" />
                                <span className="font-medium text-slate-800">
                                  {new Date(slot.datetime).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                              {!slot.isBooked && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteSlot(slot._id)}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            <span className={`text-xs ${
                              slot.isBooked ? 'text-blue-600' : 'text-lime-600'
                            }`}>
                              {slot.isBooked ? 'Booked' : 'Available'} • {slot.slotDuration}min
                            </span>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">
                      Select a date to view and manage slots
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Appointments View */}
        {view === 'appointments' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-2xl font-semibold text-slate-800">Appointments</h2>
              
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-600" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                >
                  <option value="all">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="canceled">Canceled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {filteredAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <User className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No appointments found</p>
                </div>
              ) : (
                filteredAppointments
                  .sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
                  .map(apt => (
                    <div
                      key={apt._id}
                      className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-slate-800 text-lg">
                                {apt.patient.prenom} {apt.patient.nom}
                              </h3>
                              <p className="text-sm text-slate-600">
                                ID: #{apt.idRdv} • Age: {apt.patient.age}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              apt.status === 'scheduled' ? 'bg-amber-100 text-amber-700' :
                              apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                              apt.status === 'canceled' ? 'bg-red-100 text-red-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                            </span>
                          </div>

                          <div className="space-y-1 mb-3">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(apt.datetime).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Clock className="h-4 w-4" />
                              <span>{new Date(apt.datetime).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</span>
                            </div>
                          </div>

                          <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-sm text-slate-600">
                              <span className="font-medium">Reason:</span> {apt.motif}
                            </p>
                          </div>
                        </div>

                        {apt.status === 'scheduled' && (
                          <div className="flex md:flex-col gap-2">
                            <Button
                              onClick={() => {
                                setSelectedAppointment(apt);
                                setShowAppointmentDialog(true);
                              }}
                              className="flex-1 md:flex-none bg-lime-600 hover:bg-lime-700"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Confirm
                            </Button>
                            <Button
                              onClick={() => handleAppointmentAction(apt._id, 'cancel')}
                              variant="outline"
                              className="flex-1 md:flex-none text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* Slot Creation Dialog */}
        <AlertDialog open={showSlotDialog} onOpenChange={setShowSlotDialog}>
          <AlertDialogContent className="max-w-lg">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-lime-600" />
                Create Available Slots
              </AlertDialogTitle>
              <AlertDialogDescription>
                Generate time slots for {selectedDate && selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <input
                    type="time"
                    id="startTime"
                    value={slotForm.startTime}
                    onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <input
                    type="time"
                    id="endTime"
                    value={slotForm.endTime}
                    onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="duration">Slot Duration (minutes)</Label>
                <select
                  id="duration"
                  value={slotForm.duration}
                  onChange={(e) => setSlotForm({ ...slotForm, duration: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg mt-1"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                </select>
              </div>

              <Button
                onClick={generateTimeSlots}
                variant="outline"
                className="w-full"
              >
                Generate Slots Preview
              </Button>

              {slotForm.slots.length > 0 && (
                <div className="border border-slate-200 rounded-lg p-4 max-h-48 overflow-y-auto">
                  <p className="text-sm font-medium text-slate-700 mb-2">
                    {slotForm.slots.length} slots will be created:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {slotForm.slots.map((time, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-lime-100 text-lime-700 rounded-full text-sm"
                      >
                        {time}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <AlertDialogFooter>
              <Button variant="outline" onClick={() => setShowSlotDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveSlots}
                disabled={slotForm.slots.length === 0}
                className="bg-lime-600 hover:bg-lime-700"
              >
                Create Slots
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Appointment Confirmation Dialog */}
        <AlertDialog open={showAppointmentDialog} onOpenChange={setShowAppointmentDialog}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-lime-600" />
                Confirm Appointment
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to confirm this appointment?
              </AlertDialogDescription>
            </AlertDialogHeader>

            {selectedAppointment && (
              <div className="py-4 space-y-3">
                <div className="p-4 bg-lime-50 border border-lime-200 rounded-lg">
                  <p className="font-semibold text-slate-800 mb-2">
                    {selectedAppointment.patient.prenom} {selectedAppointment.patient.nom}
                  </p>
                  <div className="space-y-1 text-sm text-slate-600">
                    <p>📅 {new Date(selectedAppointment.datetime).toLocaleDateString()}</p>
                    <p>🕐 {new Date(selectedAppointment.datetime).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                    <p>📧 {selectedAppointment.patient.email}</p>
                    <p>📱 {selectedAppointment.patient.contact}</p>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm">
                    <span className="font-medium text-slate-700">Reason:</span>
                    <br />
                    {selectedAppointment.motif}
                  </p>
                </div>
              </div>
            )}

            <AlertDialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAppointmentDialog(false);
                  setSelectedAppointment(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleAppointmentAction(selectedAppointment._id, 'confirm')}
                className="bg-lime-600 hover:bg-lime-700"
              >
                Confirm Appointment
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}