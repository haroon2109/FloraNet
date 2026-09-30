"use client";

import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Header from '@/components/alerts/Header';
import FilterBar from '@/components/alerts/FilterBar';
import ActiveAlerts from '@/components/alerts/ActiveAlerts';
import ResolvedAlerts from '@/components/alerts/ResolvedAlerts';
import AlertsSummary from '@/components/alerts/AlertsSummary';
import AlertsByField from '@/components/alerts/AlertsByField';
import AIRecommendations from '@/components/alerts/AIRecommendations';
import { alertsPageData } from '@/data/alertsData';
import { AlertItem, ResolvedAlertItem } from '@/types/alerts';
import { useToast } from '@/context/toastContext';

export default function AlertsPage() {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All Alerts');
  const [selectedField, setSelectedField] = useState('All Fields');
  const [searchTerm, setSearchTerm] = useState('');

  const [activeAlerts, setActiveAlerts] = useState<AlertItem[]>(alertsPageData.activeAlerts);
  const [resolvedAlerts, setResolvedAlerts] = useState<ResolvedAlertItem[]>(alertsPageData.resolvedAlerts);

  const { showToast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleResolveAlert = (alertId: string) => {
    const alertToResolve = activeAlerts.find(a => a.id === alertId);
    if (!alertToResolve) return;

    setActiveAlerts(prev => prev.filter(a => a.id !== alertId));
    
    const resolvedId = `res-${Date.now()}`;
    const newResolved: ResolvedAlertItem = {
      id: resolvedId,
      title: alertToResolve.title,
      description: alertToResolve.description,
      field: alertToResolve.field,
      crop: alertToResolve.crop,
      timeAgo: 'Just now',
      timestamp: 'Today, Just now',
      priority: 'normal',
      status: 'resolved',
      iconType: 'check',
    };
    setResolvedAlerts(prev => [newResolved, ...prev]);

    // Google-style Toast with instant Undo recovery
    showToast(
      `Resolved: ${alertToResolve.title}`,
      'success',
      {
        label: 'Undo',
        onClick: () => {
          setResolvedAlerts(prev => prev.filter(r => r.id !== resolvedId));
          setActiveAlerts(prev => [alertToResolve, ...prev]);
        }
      }
    );
  };

  const filteredActiveAlerts = useMemo(() => {
    return activeAlerts.filter(alert => {
      // Filter by Priority / Category
      if (activeFilter !== 'All Alerts') {
        const priorityMatch = alert.priority.toLowerCase() === activeFilter.toLowerCase();
        if (!priorityMatch) return false;
      }

      // Filter by Field
      if (selectedField !== 'All Fields') {
        if (!alert.field.toLowerCase().includes(selectedField.toLowerCase())) {
          return false;
        }
      }

      // Search Query
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = alert.title.toLowerCase().includes(q);
        const matchesDesc = alert.description.toLowerCase().includes(q);
        const matchesCrop = alert.crop.toLowerCase().includes(q);
        const matchesField = alert.field.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesCrop && !matchesField) {
          return false;
        }
      }

      return true;
    });
  }, [activeAlerts, activeFilter, selectedField, searchTerm]);

  if (!mounted) return null;

  return (
    <DashboardLayout>
      {/* Top Header */}
      <Header />

      {/* Filter Bar */}
      <FilterBar 
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        selectedField={selectedField}
        onFieldChange={setSelectedField}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Core Layout Grid (Active/Resolved Tables + Right Panel) */}
      <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 flex-1">
        
        {/* Left Main Area: Active Alerts & Resolved Alerts */}
        <main className="flex-1 min-w-0 space-y-6">
          <ActiveAlerts 
            alerts={filteredActiveAlerts} 
            onResolveAlert={handleResolveAlert}
            onResetFilters={() => {
              setActiveFilter('all');
              setSelectedField('All Fields');
              setSearchTerm('');
            }}
          />
          <ResolvedAlerts alerts={resolvedAlerts} />
        </main>

        {/* Right Panel (~350px) */}
        <aside className="w-full xl:w-[350px] shrink-0 flex flex-col gap-6">
          <AlertsSummary />
          <AlertsByField />
          <AIRecommendations />
        </aside>

      </div>
    </DashboardLayout>
  );
}
