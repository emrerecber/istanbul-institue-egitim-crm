'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Table } from '@/components/Table';
import { RegistrationForm } from '@/components/RegistrationForm';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Registration {
  id: string;
  person: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
  };
  course: {
    id: string;
    name: string;
    code: string;
    startDate: Date;
    endDate: Date;
    price: any;
  };
  company: {
    id: string;
    name: string;
  } | null;
  status: string;
  paymentStatus: string;
  totalAmount: any;
  paidAmount: any;
  discount: any;
  registrationDate: Date;
  notes: string | null;
}

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);

  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pendingPayments: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchRegistrations();
  }, [searchTerm, statusFilter, paymentStatusFilter]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (paymentStatusFilter) params.append('paymentStatus', paymentStatusFilter);

      const response = await fetch(`/api/registrations?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch registrations');

      const data = await response.json();
      setRegistrations(data);

      // Calculate stats
      const totalRegs = data.length;
      const confirmed = data.filter((r: Registration) => r.status === 'CONFIRMED').length;
      const pendingPay = data.filter((r: Registration) => 
        r.paymentStatus === 'PENDING' || r.paymentStatus === 'PARTIAL'
      ).length;
      const revenue = data.reduce((sum: number, r: Registration) => 
        sum + parseFloat(r.paidAmount?.toString() || '0'), 0
      );

      setStats({
        total: totalRegs,
        confirmed,
        pendingPayments: pendingPay,
        totalRevenue: revenue,
      });
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRegistration = () => {
    setSelectedRegistration(null);
    setIsModalOpen(true);
  };

  const handleEditRegistration = (registration: Registration) => {
    setSelectedRegistration(registration);
    setIsModalOpen(true);
  };

  const handleDeleteRegistration = async (id: string) => {
    if (!confirm('Bu kaydı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/registrations/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete registration');

      fetchRegistrations();
    } catch (error) {
      console.error('Error deleting registration:', error);
      alert('Kayıt silinirken bir hata oluştu');
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      const url = selectedRegistration
        ? `/api/registrations/${selectedRegistration.id}`
        : '/api/registrations';
      const method = selectedRegistration ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save registration');
      }

      setIsModalOpen(false);
      fetchRegistrations();
    } catch (error) {
      console.error('Error saving registration:', error);
      alert(error instanceof Error ? error.message : 'Bir hata oluştu');
      throw error;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      POTENTIAL: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Potansiyel' },
      CONFIRMED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Onaylandı' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', label: 'İptal' },
      COMPLETED: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Tamamlandı' },
    };

    const config = statusConfig[status] || statusConfig.POTENTIAL;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Bekliyor' },
      PARTIAL: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Kısmi' },
      PAID: { bg: 'bg-green-100', text: 'text-green-800', label: 'Ödendi' },
      REFUNDED: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'İade' },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const columns = [
    {
      key: 'person',
      header: 'Kişi',
      render: (reg: Registration) => (
        <div>
          <div className="font-medium text-gray-900">
            {reg.person.firstName} {reg.person.lastName}
          </div>
          {reg.person.email && (
            <div className="text-xs text-gray-500">{reg.person.email}</div>
          )}
        </div>
      ),
    },
    {
      key: 'course',
      header: 'Eğitim',
      render: (reg: Registration) => (
        <div>
          <div className="font-medium">{reg.course.name}</div>
          <div className="text-xs text-gray-500">{reg.course.code}</div>
        </div>
      ),
    },
    {
      key: 'company',
      header: 'Firma',
      render: (reg: Registration) => reg.company?.name || '-',
    },
    {
      key: 'dates',
      header: 'Kayıt Tarihi',
      render: (reg: Registration) => formatDate(reg.registrationDate),
    },
    {
      key: 'payment',
      header: 'Ödeme',
      render: (reg: Registration) => {
        const total = parseFloat(reg.totalAmount?.toString() || '0');
        const paid = parseFloat(reg.paidAmount?.toString() || '0');
        const remaining = total - paid;
        return (
          <div className="text-sm">
            <div className="font-medium">{formatCurrency(paid)} / {formatCurrency(total)}</div>
            {remaining > 0 && (
              <div className="text-xs text-orange-600">Kalan: {formatCurrency(remaining)}</div>
            )}
          </div>
        );
      },
    },
    {
      key: 'paymentStatus',
      header: 'Ödeme Durumu',
      render: (reg: Registration) => getPaymentStatusBadge(reg.paymentStatus),
    },
    {
      key: 'status',
      header: 'Durum',
      render: (reg: Registration) => getStatusBadge(reg.status),
    },
    {
      key: 'actions',
      header: 'İşlemler',
      render: (reg: Registration) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => handleEditRegistration(reg)}
            className="text-blue-600 hover:text-blue-800"
          >
            Düzenle
          </Button>
          <Button
            variant="ghost"
            onClick={() => handleDeleteRegistration(reg.id)}
            className="text-red-600 hover:text-red-800"
          >
            Sil
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Kayıtlar</h1>
        <Button onClick={handleAddRegistration}>+ Yeni Kayıt</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-sm text-gray-600">Toplam Kayıt</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Onaylanmış</div>
          <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Bekleyen Ödemeler</div>
          <div className="text-2xl font-bold text-orange-600">{stats.pendingPayments}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Toplam Gelir</div>
          <div className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalRevenue)}</div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Ara (kişi, eğitim)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tüm Durumlar</option>
            <option value="POTENTIAL">Potansiyel</option>
            <option value="CONFIRMED">Onaylandı</option>
            <option value="CANCELLED">İptal Edildi</option>
            <option value="COMPLETED">Tamamlandı</option>
          </select>
          <select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tüm Ödemeler</option>
            <option value="PENDING">Bekliyor</option>
            <option value="PARTIAL">Kısmi</option>
            <option value="PAID">Ödendi</option>
          </select>
          {(searchTerm || statusFilter || paymentStatusFilter) && (
            <Button
              variant="secondary"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setPaymentStatusFilter('');
              }}
            >
              Filtreleri Temizle
            </Button>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          data={registrations}
          isLoading={loading}
          emptyMessage="Kayıt bulunamadı"
        />
      </Card>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedRegistration ? 'Kayıt Düzenle' : 'Yeni Kayıt Ekle'}
      >
        <RegistrationForm
          registration={selectedRegistration}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
