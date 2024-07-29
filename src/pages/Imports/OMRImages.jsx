import React from 'react';

const OMRImages = ({ handleFileUpload, handleImagesUpload, selectedFile }) => {
  return (
    <div className="tab-pane active d-flex align-items-center justify-content-around py-3 mt-5" id="OMRImages">
      <p className="head text-center fs-3">Upload OMR Images</p>
      <div className="d-flex justify-content-center align-items-center">
        <p>
          <input type="file" onChange={handleFileUpload} multiple accept=".jpg,.jpeg" />
        </p>
        {selectedFile && (
          <button className="btn btn-primary align-items-center" onClick={handleImagesUpload}>
            Upload
          </button>
        )}
      </div>
    </div>
  );
};

export default OMRImages;

