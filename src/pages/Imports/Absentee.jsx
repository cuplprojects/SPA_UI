import React, { useEffect, useState } from 'react';
import './style.css';
import { Button } from 'antd';
import { useProjectId } from '@/store/ProjectState';
import { useDatabase } from '@/store/DatabaseStore';
import { useUserToken } from '@/store/UserDataStore';

const Absentee = ({
  handleFileUpload,
  handleAbsenteeUpload,
  selectedFile,
  handleDeleteAbsentee,
  headers,
  mapping,
  handleMappingChange,
  loading,
 
}) => {
  const [isValidData, setIsValidData] = useState(false);
  const [count,setCount] = useState([]);
  const token = useUserToken();
const ProjectId = useProjectId();
const database = useDatabase();
const apiurl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    getCount();
    // Check if all properties in mapping have a corresponding header in headers
    const isValid = Object.values(mapping).every((value) => headers.includes(value));
    setIsValidData(isValid);
  }, [headers, mapping]);

  // Get already mapped headers
  const mappedHeaders = Object.values(mapping);

  const getCount = async()=>{
    try{
    const response = await fetch(`${apiurl}/Absentee/absentee/count/${ProjectId}?WhichDatabase=${database}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
    const count = await response.json()
    setCount(count);
  }
  catch(error){
    console.error('Failed to fetch count',error)
  }
  }

  return (
    <>
      <div className={`tab-pane active d-flex align-items-center justify-content-around py-3 mt-5`} id="absentee">
        <h3 className="head text-center fs-3">Upload Absentee</h3>
        <div className="d-flex justify-content-center align-items-center">
          <p>
            <input type="file" onChange={handleFileUpload} accept=".xlsx" />
          </p>
          {count > 0 &&
          <Button danger onClick={handleDeleteAbsentee} disabled={loading}>
             Delete
          </Button>
          }
        </div>
        {count !== null ? (
          <p className="count-display text-center mt-4">
            Current Absentee Count: {count}
          </p>
        ) : (
          <p className="text-center mt-4">Loading count...</p>
        )}
        {headers.length > 0 && (
          <div className="d-flex justify-content-center mt-4">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Model Property</th>
                  <th>Excel Header</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(mapping).map((property) => (
                  <tr key={property}>
                    <td>{property}</td>
                    <td>
                      <select value={mapping[property]} onChange={(e) => handleMappingChange(e, property)}>
                        <option value="">Select Header</option>
                        {headers.filter(header => !mappedHeaders.includes(header) || header === mapping[property]).map((header, index) => (
                          <option key={header} value={header}>
                            {header}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {selectedFile && (
        <div className="d-flex justify-content-center mt-4">
          <button className="btn btn-primary" onClick={handleAbsenteeUpload} disabled={loading}>
            {loading ? 'Uploading' : 'Upload'}
          </button>
        </div>
      )}
   
    </>
  );
};

export default Absentee;
