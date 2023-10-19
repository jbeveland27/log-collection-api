import axios from 'axios';
import { useState, useRef, useEffect } from 'react';

export const useAxios = (url: string, method: string, payload?: object) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const controllerRef = useRef(new AbortController());
  const cancel = () => {
    controllerRef.current.abort();
  };

  useEffect(() => {
    setLoaded(false);
    setError('');

    (async () => {
      try {
        const response = await axios.request({
          data: payload,
          signal: controllerRef.current.signal,
          method,
          url,
        });

        setData(response.data);
      } catch (error: any) {
        setError(`${error.message} | Reason: ${error?.response?.data?.constraintsViolated?.entries}`);
      } finally {
        setLoaded(true);
      }
    })();
  }, [url, method, payload]);

  return { cancel, data, error, loaded };
};
