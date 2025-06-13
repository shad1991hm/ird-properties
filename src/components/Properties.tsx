import React, { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Package, Eye } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { Property } from '../types';
import PropertyForm from './PropertyForm';
import PropertyDetails from './PropertyDetails';

const Properties: React.FC = () => {
  const { properties, deleteProperty } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [viewingProperty, setViewingProperty] = useState<Property | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');

  const filteredProperties = properties
    .filter(property => {
      const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           property.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           property.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || property.propertyType === filterType;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'date': return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'quantity': return b.quantity - a.quantity;
        case 'value': return b.totalPrice - a.totalPrice;
        default: return 0;
      }
    });

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      deleteProperty(id);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProperty(null);
  };

  const getStockStatus = (property: Property) => {
    const percentage = (property.availableQuantity / property.quantity) * 100;
    if (percentage <= 10) return { status: 'critical', color: 'text-red-600 bg-red-50' };
    if (percentage <= 25) return { status: 'low', color: 'text-orange-600 bg-orange-50' };
    if (percentage <= 50) return { status: 'medium', color: 'text-yellow-600 bg-yellow-50' };
    return { status: 'good', color: 'text-green-600 bg-green-50' };
  };

  const PropertyCard: React.FC<{ property: Property }> = ({ property }) => {
    const stockStatus = getStockStatus(property);
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <Package className="w-5 h-5 text-primary-600 flex-shrink-0" />
                <h3 className="text-lg font-semibold text-gray-900 truncate">{property.name}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-1">#{property.number}</p>
              <p className="text-sm text-gray-500">{property.companyName}</p>
            </div>
            <div className="flex items-center space-x-2 mt-3 sm:mt-0">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                property.propertyType === 'permanent' ? 'bg-blue-100 text-blue-800' :
                property.propertyType === 'temporary' ? 'bg-gray-100 text-gray-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {property.propertyType.replace('-', ' ')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Available</p>
              <p className="text-lg font-semibold text-gray-900">
                {property.availableQuantity} / {property.quantity}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    stockStatus.status === 'critical' ? 'bg-red-500' :
                    stockStatus.status === 'low' ? 'bg-orange-500' :
                    stockStatus.status === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${(property.availableQuantity / property.quantity) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total Value</p>
              <p className="text-lg font-semibold text-gray-900">
                {property.totalPrice.toLocaleString()} ETB
              </p>
              <p className="text-sm text-gray-500">
                {property.unitPrice.toLocaleString()} ETB/{property.measurement}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => setViewingProperty(property)}
              className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </button>
            <button
              onClick={() => handleEdit(property)}
              className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-secondary-600 bg-secondary-50 hover:bg-secondary-100 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </button>
            <button
              onClick={() => handleDelete(property.id)}
              className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (showForm) {
    return (
      <PropertyForm
        property={editingProperty}
        onClose={handleCloseForm}
      />
    );
  }

  if (viewingProperty) {
    return (
      <PropertyDetails
        property={viewingProperty}
        onClose={() => setViewingProperty(null)}
        onEdit={() => {
          setEditingProperty(viewingProperty);
          setViewingProperty(null);
          setShowForm(true);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-600">Manage your property inventory</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Property
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Properties</p>
              <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
            </div>
            <Package className="w-8 h-8 text-primary-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {properties.reduce((sum, p) => sum + p.totalPrice, 0).toLocaleString()}
              </p>
            </div>
            <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center">
              <span className="text-secondary-600 font-bold">ETB</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-orange-600">
                {properties.filter(p => (p.availableQuantity / p.quantity) <= 0.25).length}
              </p>
            </div>
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-600 text-xl">⚠</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available Items</p>
              <p className="text-2xl font-bold text-green-600">
                {properties.reduce((sum, p) => sum + p.availableQuantity, 0)}
              </p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-xl">✓</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="permanent">Permanent</option>
              <option value="temporary">Temporary</option>
              <option value="permanent-temporary">Permanent-Temporary</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="name">Sort by Name</option>
              <option value="date">Sort by Date</option>
              <option value="quantity">Sort by Quantity</option>
              <option value="value">Sort by Value</option>
            </select>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      {filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || filterType !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by adding your first property'
            }
          </p>
          {!searchTerm && filterType === 'all' && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Property
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Properties;