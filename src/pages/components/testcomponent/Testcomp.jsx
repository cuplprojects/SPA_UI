import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table } from 'react-bootstrap';

const Testcomp = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://fakestoreapi.com/products');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="mb-4">
      <h1>Products</h1>
      <Table striped bordered hover className="mb-4">
        <thead >
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Price</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          {data.map((product) => (
            <tr key={product.id} style={{ backgroundColor: product.id % 2 === 0 ? '#f2f2f2' : 'red' }}>
              <td className='text-blue-600/100'>{product.id}</td>
              <td className='text-success'>{product.title}</td>
              <td>${product.price}</td>
              <td>{product.category}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      {/* Additional content */}
    </div>
  );
};

export default Testcomp;
