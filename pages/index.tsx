import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  const [database, setDatabase] = useState('');
  const [collection, setCollection] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const accessKey = router.query.key as string;
    
    if (!accessKey) {
      setChecking(false);
      return;
    }

    // Проверка ключа доступа
    if (accessKey === process.env.NEXT_PUBLIC_ACCESS_KEY) {
      setIsAuthorized(true);
    }
    setChecking(false);
  }, [router.query.key]);

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(
        `/api/download?database=${encodeURIComponent(database)}&collection=${encodeURIComponent(collection)}`,
        {
          headers: {
            'x-api-key': apiKey,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to download collection');
      }

      const data = await response.json();
      
      // Создание и скачивание файла
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${collection}_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setSuccess(`Successfully downloaded ${data.count} documents from ${collection}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Показываем загрузку при проверке
  if (checking) {
    return (
      <>
        <Head>
          <title>MongoDB Collection Downloader</title>
        </Head>
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
          <div style={{ color: 'white', fontSize: '18px' }}>Loading...</div>
        </div>
      </>
    );
  }

  // Показываем ошибку доступа
  if (!isAuthorized) {
    return (
      <>
        <Head>
          <title>Access Denied</title>
        </Head>
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            padding: '40px',
            maxWidth: '500px',
            width: '100%',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>🔒</div>
            <h1 style={{ margin: '0 0 10px 0', fontSize: '28px', color: '#333' }}>
              Access Denied
            </h1>
            <p style={{ margin: '0', color: '#666', fontSize: '16px' }}>
              You need a valid access key in the URL to view this page.
            </p>
            <p style={{ margin: '20px 0 0 0', color: '#999', fontSize: '14px' }}>
              Format: /?key=YOUR_ACCESS_KEY
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>MongoDB Collection Downloader</title>
        <meta name="description" content="Download MongoDB collections securely" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          padding: '40px',
          maxWidth: '500px',
          width: '100%'
        }}>
          <h1 style={{
            margin: '0 0 10px 0',
            fontSize: '28px',
            color: '#333',
            textAlign: 'center'
          }}>
            MongoDB Downloader
          </h1>
          <p style={{
            margin: '0 0 30px 0',
            color: '#666',
            textAlign: 'center',
            fontSize: '14px'
          }}>
            Securely download collections from your database
          </p>

          <form onSubmit={handleDownload}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#333',
                fontSize: '14px'
              }}>
                Database Name
              </label>
              <input
                type="text"
                value={database}
                onChange={(e) => setDatabase(e.target.value)}
                required
                placeholder="e.g., myDatabase"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.3s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#333',
                fontSize: '14px'
              }}>
                Collection Name
              </label>
              <input
                type="text"
                value={collection}
                onChange={(e) => setCollection(e.target.value)}
                required
                placeholder="e.g., users"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.3s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#333',
                fontSize: '14px'
              }}>
                API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
                placeholder="Enter your API key"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.3s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>

            {error && (
              <div style={{
                padding: '12px',
                background: '#fee',
                border: '1px solid #fcc',
                borderRadius: '8px',
                color: '#c33',
                marginBottom: '20px',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{
                padding: '12px',
                background: '#efe',
                border: '1px solid #cfc',
                borderRadius: '8px',
                color: '#3c3',
                marginBottom: '20px',
                fontSize: '14px'
              }}>
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'transform 0.2s',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {loading ? 'Downloading...' : 'Download Collection'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}