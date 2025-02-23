import { AlertCircle, Check, Clock, DollarSign, Plus, Scissors, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { servicesApi } from '../../config/api';
import { barberApi } from '../../config/barberApi';
import { useAuth } from '../../context/AuthContext';

function BarberServices({ barberId }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [barber, setBarber] = useState(null);
  const [availableServices, setAvailableServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const { user } = useAuth();
  const isAdmin = user && user.role === 'admin';
  const [newService, setNewService] = useState({
    name: '',
    price: '',
    duration: '',
    description: ''
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (barberId) {
      fetchData();
    }
  }, [barberId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      // Carica i dati del barbiere
      const barberData = await barberApi.getBarberDetails(barberId);
      setBarber(barberData);
      setSelectedServices(barberData.services || []);

      // Carica tutti i servizi disponibili
      const servicesData = await servicesApi.getActiveServices();
      setAvailableServices(servicesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Errore nel caricamento dei dati. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceToggle = (serviceName) => {
    const updatedServices = selectedServices.includes(serviceName)
      ? selectedServices.filter(s => s !== serviceName)
      : [...selectedServices, serviceName];

    setSelectedServices(updatedServices);
    setHasChanges(true);
  };

  const handleSaveServices = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Verifica che sia selezionato almeno un servizio
      if (selectedServices.length === 0) {
        setError('Seleziona almeno un servizio.');
        setSaving(false);
        return;
      }

      // Salva i servizi selezionati
      await barberApi.updateBarberServices(barberId, selectedServices);

      setSuccess('Servizi aggiornati con successo!');
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving services:', error);
      setError('Errore durante il salvataggio dei servizi. Riprova più tardi.');
    } finally {
      setSaving(false);

      // Nascondi il messaggio di successo dopo 3 secondi
      if (success) {
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      }
    }
  };

  const handleNewServiceSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');

      // Validazione
      if (!newService.name || !newService.price || !newService.duration) {
        setError('Nome, prezzo e durata sono campi obbligatori.');
        setSaving(false);
        return;
      }

      // Verifica che il prezzo e la durata siano numeri validi
      if (isNaN(Number(newService.price)) || Number(newService.price) <= 0) {
        setError('Il prezzo deve essere un numero maggiore di zero.');
        setSaving(false);
        return;
      }

      if (isNaN(Number(newService.duration)) || Number(newService.duration) <= 0) {
        setError('La durata deve essere un numero maggiore di zero.');
        setSaving(false);
        return;
      }

      // Crea il nuovo servizio
      const createdService = await servicesApi.createService({
        ...newService,
        price: Number(newService.price),
        duration: Number(newService.duration)
      });

      // Aggiorna la lista dei servizi disponibili
      setAvailableServices([...availableServices, createdService]);

      // Seleziona automaticamente il nuovo servizio
      setSelectedServices([...selectedServices, createdService.name]);
      setHasChanges(true);

      // Resetta il form e chiudi il modale
      setNewService({
        name: '',
        price: '',
        duration: '',
        description: ''
      });
      setShowAddServiceModal(false);
    } catch (error) {
      console.error('Error creating service:', error);
      setError('Errore durante la creazione del servizio. Riprova più tardi.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)]"></div>
      </div>
    );
  }

  if (!barber) {
    return (
      <div className="text-center py-8 text-red-500">
        <AlertCircle className="w-12 h-12 mx-auto mb-4" />
        <p className="text-lg">Dati del barbiere non trovati. Ricarica la pagina o contatta l'amministratore.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[var(--accent)]">
          Gestione Servizi
        </h2>

        <div className="flex gap-2">
    {isAdmin && (
      <button
        onClick={() => setShowAddServiceModal(true)}
        className="bg-[var(--bg-primary)] border border-[var(--accent)] text-[var(--accent)] px-4 py-2 rounded-lg hover:bg-[var(--accent)] hover:text-white transition-colors flex items-center"
      >
        <Plus className="w-4 h-4 mr-2" />
        Nuovo Servizio
      </button>
    )}

    {hasChanges && (
      <button
        onClick={handleSaveServices}
        disabled={saving}
        className="bg-[var(--accent)] text-white px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center"
      >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Salva
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-500 text-white p-4 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-500 text-white p-4 rounded-lg flex items-center">
          <Check className="w-5 h-5 mr-2 flex-shrink-0" />
          <p>{success}</p>
        </div>
      )}

      {/* Lista dei servizi */}
      <div className="bg-[var(--bg-primary)] p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-6 flex items-center">
          <Scissors className="w-5 h-5 mr-2" />
          Servizi Disponibili
        </h3>

        {availableServices.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Scissors className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>Nessun servizio disponibile. Aggiungi un nuovo servizio per iniziare.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableServices.map(service => (
              <div
                key={service._id}
                className={`bg-[var(--bg-secondary)] p-4 rounded-lg border-2 transition-colors ${
                  selectedServices.includes(service.name)
                    ? 'border-[var(--accent)]'
                    : 'border-transparent'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-lg">{service.name}</h4>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-400">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        <span>CHF {service.price.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{service.duration} min</span>
                      </div>
                    </div>
                    {service.description && (
                      <p className="mt-2 text-sm">{service.description}</p>
                    )}
                  </div>

                  <button
                    onClick={() => handleServiceToggle(service.name)}
                    className={`ml-2 p-2 rounded-full ${
                      selectedServices.includes(service.name)
                        ? 'bg-[var(--accent)] text-white'
                        : 'bg-[var(--bg-primary)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {selectedServices.includes(service.name) ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Plus className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modale per aggiungere un nuovo servizio */}
      {showAddServiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-primary)] rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Nuovo Servizio</h3>
              <button
                onClick={() => setShowAddServiceModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleNewServiceSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome del servizio</label>
                <input
                  type="text"
                  value={newService.name}
                  onChange={(e) => setNewService({...newService, name: e.target.value})}
                  className="w-full p-2 rounded bg-[var(--bg-secondary)] border border-[var(--accent)]"
                  placeholder="es. Taglio Uomo"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Prezzo (CHF)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newService.price}
                    onChange={(e) => setNewService({...newService, price: e.target.value})}
                    className="w-full p-2 rounded bg-[var(--bg-secondary)] border border-[var(--accent)]"
                    placeholder="es. 25.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Durata (minuti)</label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={newService.duration}
                    onChange={(e) => setNewService({...newService, duration: e.target.value})}
                    className="w-full p-2 rounded bg-[var(--bg-secondary)] border border-[var(--accent)]"
                    placeholder="es. 30"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descrizione (opzionale)</label>
                <textarea
                  value={newService.description}
                  onChange={(e) => setNewService({...newService, description: e.target.value})}
                  className="w-full p-2 rounded bg-[var(--bg-secondary)] border border-[var(--accent)]"
                  placeholder="Descrivi brevemente il servizio..."
                  rows="3"
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddServiceModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white hover:opacity-90 disabled:opacity-50 flex items-center"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creando...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Crea Servizio
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default BarberServices;
