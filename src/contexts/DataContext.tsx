import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Property, PropertyRequest, IssuedProperty } from '../types';
import { propertiesAPI, requestsAPI, issuanceAPI } from '../services/api';
import { useAuth } from './AuthContext';

interface DataContextType {
  properties: Property[];
  requests: PropertyRequest[];
  issuedProperties: IssuedProperty[];
  loading: boolean;
  addProperty: (property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProperty: (id: string, updates: Partial<Property>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  addRequest: (request: Omit<PropertyRequest, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateRequest: (id: string, updates: Partial<PropertyRequest>) => Promise<void>;
  issueProperty: (requestId: string) => Promise<void>; // Removed storeManagerId and storeManagerName
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [requests, setRequests] = useState<PropertyRequest[]>([]);
  const [issuedProperties, setIssuedProperties] = useState<IssuedProperty[]>([]);
  const [loading, setLoading] = useState(true);

  // Define more specific types for database objects
  interface DbProperty {
    id: string;
    number: string;
    name: string;
    model_number: string;
    serial_number: string;
    date: string;
    company_name: string;
    measurement: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    property_type: 'permanent' | 'temporary' | 'permanent-temporary';
    available_quantity: number;
    created_at: string;
    updated_at: string;
  }

  const transformProperty = React.useCallback((dbProperty: DbProperty): Property => ({
    id: dbProperty.id,
    number: dbProperty.number,
    name: dbProperty.name,
    modelNumber: dbProperty.model_number,
    serialNumber: dbProperty.serial_number,
    date: dbProperty.date,
    companyName: dbProperty.company_name,
    measurement: dbProperty.measurement,
    quantity: dbProperty.quantity,
    unitPrice: dbProperty.unit_price,
    totalPrice: dbProperty.total_price,
    propertyType: dbProperty.property_type,
    availableQuantity: dbProperty.available_quantity,
    createdAt: dbProperty.created_at,
    updatedAt: dbProperty.updated_at
  }), []);

  interface DbRequest {
    id: string;
    user_id: string;
    user_name: string;
    user_department: string;
    property_id: string;
    property_number: string;
    property_name: string;
    quantity_type: string;
    requested_quantity: number;
    approved_quantity?: number;
    status: 'pending' | 'approved' | 'rejected' | 'adjusted' | 'issued';
    reason?: string;
    admin_id?: string;
    store_manager_id?: string;
    created_at: string;
    updated_at: string;
    issued_at?: string;
  }

  const transformRequest = React.useCallback((dbRequest: DbRequest): PropertyRequest => ({
    id: dbRequest.id,
    userId: dbRequest.user_id,
    userName: dbRequest.user_name,
    userDepartment: dbRequest.user_department,
    propertyId: dbRequest.property_id,
    propertyNumber: dbRequest.property_number,
    propertyName: dbRequest.property_name,
    quantityType: dbRequest.quantity_type,
    requestedQuantity: dbRequest.requested_quantity,
    approvedQuantity: dbRequest.approved_quantity,
    status: dbRequest.status,
    reason: dbRequest.reason,
    adminId: dbRequest.admin_id,
    storeManagerId: dbRequest.store_manager_id,
    createdAt: dbRequest.created_at,
    updatedAt: dbRequest.updated_at,
    issuedAt: dbRequest.issued_at
  }), []);

  interface DbIssuedProperty {
    id: string;
    request_id: string;
    property_id: string;
    user_id: string;
    user_name: string;
    user_department: string;
    property_number: string;
    property_name: string;
    model_number: string;
    serial_number: string;
    quantity_type: string;
    issued_quantity: number;
    issued_at: string;
    store_manager_id: string;
    store_manager_name: string;
    is_permanent: boolean;
  }

  const transformIssuedProperty = React.useCallback((dbIssued: DbIssuedProperty): IssuedProperty => ({
    id: dbIssued.id,
    requestId: dbIssued.request_id,
    propertyId: dbIssued.property_id,
    userId: dbIssued.user_id,
    userName: dbIssued.user_name,
    userDepartment: dbIssued.user_department,
    propertyNumber: dbIssued.property_number,
    propertyName: dbIssued.property_name,
    modelNumber: dbIssued.model_number,
    serialNumber: dbIssued.serial_number,
    quantityType: dbIssued.quantity_type,
    issuedQuantity: dbIssued.issued_quantity,
    issuedAt: dbIssued.issued_at,
    storeManagerId: dbIssued.store_manager_id,
    storeManagerName: dbIssued.store_manager_name,
    isPermanent: dbIssued.is_permanent
  }), []);

  // Memoize fetchData with useCallback
  const fetchData = React.useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const [propertiesRes, requestsRes, issuedRes] = await Promise.all([
        propertiesAPI.getAll(),
        requestsAPI.getAll(),
        issuanceAPI.getIssuedProperties()
      ]);

      setProperties(propertiesRes.data.map(transformProperty));
      setRequests(requestsRes.data.map(transformRequest));
      setIssuedProperties(issuedRes.data.map(transformIssuedProperty));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, transformProperty, transformRequest, transformIssuedProperty]); // Add user and transform functions as dependencies

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]); // Add fetchData to the dependency array of useEffect

  const addProperty = async (propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const dbData = {
        number: propertyData.number,
        name: propertyData.name,
        model_number: propertyData.modelNumber,
        serial_number: propertyData.serialNumber,
        date: propertyData.date,
        company_name: propertyData.companyName,
        measurement: propertyData.measurement,
        quantity: propertyData.quantity,
        unit_price: propertyData.unitPrice,
        property_type: propertyData.propertyType
      };

      await propertiesAPI.create(dbData);
      await fetchData(); // Refresh data
    } catch (error) {
      console.error('Error adding property:', error);
      throw error;
    }
  };

  const updateProperty = async (id: string, updates: Partial<Property>) => {
    try {
      // Define a type for property updates to backend
      interface DbPropertyUpdate {
        number?: string;
        name?: string;
        model_number?: string;
        serial_number?: string;
        date?: string;
        company_name?: string;
        measurement?: string;
        quantity?: number;
        unit_price?: number;
        property_type?: 'permanent' | 'temporary' | 'permanent-temporary';
        available_quantity?: number; // This might be calculated backend-side
      }
      const dbUpdates: DbPropertyUpdate = {};
      
      if (updates.number) dbUpdates.number = updates.number;
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.modelNumber) dbUpdates.model_number = updates.modelNumber;
      if (updates.serialNumber) dbUpdates.serial_number = updates.serialNumber;
      if (updates.date) dbUpdates.date = updates.date;
      if (updates.companyName) dbUpdates.company_name = updates.companyName;
      if (updates.measurement) dbUpdates.measurement = updates.measurement;
      if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
      if (updates.unitPrice !== undefined) dbUpdates.unit_price = updates.unitPrice;
      if (updates.propertyType) dbUpdates.property_type = updates.propertyType;
      // availableQuantity is often calculated based on quantity or other actions,
      // so it might not be directly updatable or handled differently by the backend.
      // If it is updatable, it would be:
      // if (updates.availableQuantity !== undefined) dbUpdates.available_quantity = updates.availableQuantity;


      await propertiesAPI.update(id, dbUpdates);
      await fetchData(); // Refresh data
    } catch (error) {
      console.error('Error updating property:', error);
      throw error;
    }
  };

  const deleteProperty = async (id: string) => {
    try {
      await propertiesAPI.delete(id);
      await fetchData(); // Refresh data
    } catch (error) {
      console.error('Error deleting property:', error);
      throw error;
    }
  };

  const addRequest = async (requestData: Omit<PropertyRequest, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const dbData = {
        property_id: requestData.propertyId,
        property_number: requestData.propertyNumber,
        property_name: requestData.propertyName,
        quantity_type: requestData.quantityType,
        requested_quantity: requestData.requestedQuantity
      };

      await requestsAPI.create(dbData);
      await fetchData(); // Refresh data
    } catch (error) {
      console.error('Error adding request:', error);
      throw error;
    }
  };

  const updateRequest = async (id: string, updates: Partial<PropertyRequest>) => {
    try {
      // Define a type for request updates to backend
      interface DbRequestUpdate {
        status?: 'pending' | 'approved' | 'rejected' | 'adjusted' | 'issued';
        approved_quantity?: number;
        reason?: string;
        admin_id?: string; // Assuming admin_id might be set on update
        store_manager_id?: string; // Assuming store_manager_id might be set on update
        issued_at?: string; // Assuming issued_at might be set on update
      }
      const dbUpdates: DbRequestUpdate = {};
      
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.approvedQuantity !== undefined) dbUpdates.approved_quantity = updates.approvedQuantity;
      if (updates.reason !== undefined) dbUpdates.reason = updates.reason;
      if (updates.adminId) dbUpdates.admin_id = updates.adminId;
      if (updates.storeManagerId) dbUpdates.store_manager_id = updates.storeManagerId;
      if (updates.issuedAt) dbUpdates.issued_at = updates.issuedAt;


      await requestsAPI.update(id, dbUpdates);
      await fetchData(); // Refresh data
    } catch (error) {
      console.error('Error updating request:', error);
      throw error;
    }
  };

  const issueProperty = async (requestId: string) => { // Removed storeManagerId and storeManagerName
    try {
      await issuanceAPI.issueProperty(requestId);
      await fetchData(); // Refresh data
    } catch (error) {
      console.error('Error issuing property:', error);
      throw error;
    }
  };

  const refreshData = async () => {
    await fetchData();
  };

  const value: DataContextType = {
    properties,
    requests,
    issuedProperties,
    loading,
    addProperty,
    updateProperty,
    deleteProperty,
    addRequest,
    updateRequest,
    issueProperty,
    refreshData
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};