import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import React, { useEffect, useState } from 'react';
import {
  Bar, BarChart, CartesianGrid,
  Cell, Legend, Line, LineChart,
  Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis
} from 'recharts';
import { adminApi } from '../../config/adminApi';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

function Stats() {
  const [stats, setStats] = useState({
    appointmentsByMonth: [],
    revenueByMonth: [],
    serviceStats: [],
    peakHours: [],
    barberPerformance: [],
    customerRetention: [],
    loading: true,
    error: '',
    selectedTimeframe: 'month',
    selectedBarber: 'all' // New state for barber filter
  });

  const [barbers, setBarbers] = useState([]);

  useEffect(() => {
    fetchBarbers();
    fetchStats();
  }, [stats.selectedTimeframe, stats.selectedBarber]);

  const fetchBarbers = async () => {
    try {
      const response = await fetch('/api/barbers');
      const data = await response.json();
      setBarbers(data);
    } catch (error) {
      console.error('Error fetching barbers:', error);
    }
  };

  const fetchStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true, error: '' }));
      const response = await adminApi.getStats(stats.selectedTimeframe, stats.selectedBarber);

      const formattedStats = {
        appointmentsByMonth: response.appointmentsByMonth.map(item => ({
          name: item.month,
          Appuntamenti: item.count
        })),
        revenueByMonth: response.revenueByMonth.map(item => ({
          name: item.month,
          Ricavi: item.revenue
        })),
        serviceStats: response.serviceStats,
        peakHours: response.peakHours,
        customerRetention: response.customerRetention
      };

      setStats(prev => ({
        ...prev,
        ...formattedStats,
        loading: false
      }));
    } catch (error) {
      console.error('Error in fetchStats:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: 'Errore nel caricamento delle statistiche. Riprova più tardi.'
      }));
    }
  };

  const getPeriodTitle = () => {
    switch(stats.selectedTimeframe) {
      case 'week': return 'Settimana';
      case 'month': return 'Mese';
      case 'year': return 'Anno';
      default: return 'Mese';
    }
  };

  if (stats.loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Caricamento statistiche...</p>
        </div>
      </div>
    );
  }

  if (stats.error) {
    return (
      <Card className="bg-destructive/10">
        <CardHeader>
          <CardTitle className="text-destructive">Errore</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{stats.error}</p>
          <button
            onClick={fetchStats}
            className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors"
          >
            Riprova
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8 p-6 bg-background">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-bold text-primary">Dashboard Amministratore</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <Select
            value={stats.selectedTimeframe}
            onValueChange={(value) => setStats(prev => ({ ...prev, selectedTimeframe: value }))}
            className="min-w-[200px] bg-card"
          >
            <option value="week">Questa settimana</option>
            <option value="month">Questo mese</option>
            <option value="year">Quest'anno</option>
          </Select>
          <Select
            value={stats.selectedBarber}
            onValueChange={(value) => setStats(prev => ({ ...prev, selectedBarber: value }))}
            className="min-w-[200px] bg-card"
          >
            <option value="all">Tutti i barbieri</option>
            {barbers.map(barber => (
              <option key={barber._id} value={barber._id}>
                {barber.name}
              </option>
            ))}
          </Select>
          <button
            onClick={fetchStats}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
          >
            Aggiorna
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl font-medium">Appuntamenti Totali</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">
              {stats.appointmentsByMonth.reduce((acc, curr) => acc + curr.Appuntamenti, 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl font-medium">Ricavo Totale</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">
              CHF {stats.revenueByMonth.reduce((acc, curr) => acc + curr.Ricavi, 0).toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl font-medium">Clienti Fidelizzati</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">
              {stats.customerRetention.reduce((acc, curr) =>
                curr.name !== '1 visita' ? acc + curr.value : acc, 0
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl font-medium">
              {`Appuntamenti per ${getPeriodTitle()}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.appointmentsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="Appuntamenti"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl font-medium">
              {`Ricavi per ${getPeriodTitle()}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `CHF ${value}`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="Ricavi"
                    stroke="#4CAF50"
                    strokeWidth={2}
                    dot={{ fill: "#4CAF50" }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl font-medium">Fasce Orarie Popolari</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.peakHours}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="count"
                    fill="hsl(var(--primary))"
                    name="Appuntamenti"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl font-medium">Fidelizzazione Clienti</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.customerRetention}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {stats.customerRetention.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        className="hover:opacity-80 transition-opacity"
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Stats;
