import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const ResourceContext = createContext(null);

export function ResourceProvider({ children }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/resources`);
      setResources(response.data);
    } catch (err) {
      console.error("Failed to fetch resources with Axios", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  return (
    <ResourceContext.Provider value={{ resources, loading, fetchResources }}>
      {children}
    </ResourceContext.Provider>
  );
}

export const useResources = () => {
  const ctx = useContext(ResourceContext);
  if (!ctx) throw new Error('useResources must be inside ResourceProvider');
  return ctx;
};
