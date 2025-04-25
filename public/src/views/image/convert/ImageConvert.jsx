import React, { useState, useRef } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CRow,
  CImage,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormCheck,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCloudUpload, cilImage, cilCloudDownload } from '@coreui/icons'
import JSZip from 'jszip';

const ImageConvert = () => {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [mergedImages, setMergedImages] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [selectedImages, setSelectedImages] = useState(new Set());
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    handleFileInputChange({ target: { files } });
  };

  const handleFileInputChange = (event) => {
    const files = event.target.files;
    const newImages = [];

    // 새로운 이미지 업로드 시 모든 상태 초기화
    setUploadedImages([]);
    setMergedImages([]);
    setSelectedImages(new Set());

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = function (e) {
        const image = new Image();
        image.src = e.target.result;
        image.fileName = file.name;
        image.id = Date.now() + i;

        image.onload = function () {
          newImages.push(image);
          setUploadedImages(prev => [...prev, image]);
        };
      };

      reader.readAsDataURL(file);
    }
  };

  const handleImageMerge = () => {
    const newMergedImages = [];
    const newSelectedImages = new Set();

    for (let i = 0; i < uploadedImages.length; i++) {
      const image = uploadedImages[i];
      let fileCounter = 1;

      // 기존 결과 이미지 4장 생성 (물체 개수: 2, 3, 4, 5)
      for (let j = 2; j <= 5; j++) {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          canvas.width = 1000;
          canvas.height = 1000;

          const spacing = 10;
          const numCols = Math.min(3, j);
          const numRows = Math.ceil(j / 3);
          const itemWidth = (canvas.width - (numCols - 1) * spacing) / numCols;
          const itemHeight = (canvas.height - (numRows - 1) * spacing) / numRows;

          const aspectRatio = image.width / image.height;
          let width = itemWidth;
          let height = itemHeight;

          if (aspectRatio > itemWidth / itemHeight) {
            height = width / aspectRatio;
          } else {
            width = height * aspectRatio;
          }

          for (let k = 0; k < j; k++) {
            const row = Math.floor(k / 3);
            const col = k % 3;

            let itemX = col * (itemWidth + spacing);
            const itemY = row * (itemHeight + spacing);

            if (row === numRows - 1 && j % 3 !== 0) {
              const remainingItems = j % 3;
              const totalRemainingWidth = remainingItems * (itemWidth + spacing) - spacing;
              itemX = (canvas.width - totalRemainingWidth) / 2 + col * (itemWidth + spacing);
            }

            const offsetX = (itemWidth - width) / 2;
            const offsetY = (itemHeight - height) / 2;

            ctx.drawImage(image, itemX + offsetX, itemY + offsetY, width, height);
          }

          const mergedImage = new Image();
          mergedImage.src = canvas.toDataURL("image/png");
          const fileNameWithoutExtension = image.fileName.split(".").slice(0, -1).join(".");
          mergedImage.fileName = `${fileNameWithoutExtension}_${fileCounter}.png`;
          mergedImage.id = Date.now() + fileCounter; // 고유 ID 추가
          newMergedImages.push(mergedImage);
          newSelectedImages.add(mergedImage.id);
          fileCounter++;
        } catch (error) {
          console.error("Error occurred while merging images:", error);
        }
      }

      // 45도 회전 이미지 생성
      [-45, 45].forEach(angle => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          canvas.width = 1000;
          canvas.height = 1000;

          const aspectRatio = image.width / image.height;
          let width = canvas.width / 2;
          let height = canvas.height / 2;

          if (aspectRatio > width / height) {
            height = width / aspectRatio;
          } else {
            width = height * aspectRatio;
          }

          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((angle * Math.PI) / 180);
          ctx.translate(-width / 2, -height / 2);
          ctx.drawImage(image, 0, 0, width, height);

          const mergedImage = new Image();
          mergedImage.src = canvas.toDataURL("image/png");
          const fileNameWithoutExtension = image.fileName.split(".").slice(0, -1).join(".");
          mergedImage.fileName = `${fileNameWithoutExtension}_${angle}deg_${fileCounter}.png`;
          mergedImage.id = Date.now() + fileCounter; // 고유 ID 추가
          newMergedImages.push(mergedImage);
          newSelectedImages.add(mergedImage.id);
          fileCounter++;
        } catch (error) {
          console.error("Error occurred while rotating images:", error);
        }
      });
    }

    setMergedImages(newMergedImages);
    setSelectedImages(newSelectedImages);
  };

  const handleImageDownload = async () => {
    const selectedImagesList = mergedImages.filter(image => selectedImages.has(image.id));
    
    if (selectedImagesList.length >= 10) {
      // ZIP 파일로 다운로드
      const zip = new JSZip();
      
      // 이미지들을 ZIP에 추가
      selectedImagesList.forEach(image => {
        const base64Data = image.src.split(',')[1];
        zip.file(image.fileName, base64Data, {base64: true});
      });
      
      // ZIP 파일 생성 및 다운로드
      const content = await zip.generateAsync({type: "blob"});
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = "merged_images.zip";
      link.click();
    } else {
      // 개별 다운로드
      selectedImagesList.forEach((image, index) => {
        const link = document.createElement("a");
        link.href = image.src;
        link.download = image.fileName;
        link.click();
        setTimeout(() => {}, 300);
      });
    }
  };

  const toggleImageSelection = (imageId) => {
    setSelectedImages(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(imageId)) {
        newSelected.delete(imageId);
      } else {
        newSelected.add(imageId);
      }
      return newSelected;
    });
  };

  const toggleAllImages = () => {
    if (selectedImages.size === mergedImages.length) {
      // 모두 선택된 상태면 전체 해제
      setSelectedImages(new Set());
    } else {
      // 일부만 선택되었거나 아무것도 선택되지 않은 상태면 전체 선택
      setSelectedImages(new Set(mergedImages.map(img => img.id)));
    }
  };

  return (
    <CCard className="mb-4">
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <strong>이미지 합성</strong>
        <div>
          {uploadedImages.length > 0 && (
            <CButton color="primary" onClick={handleImageMerge} className="me-2">
              이미지 합성하기
            </CButton>
          )}
          {mergedImages.length > 0 && (
            <CButton 
              color="success" 
              onClick={handleImageDownload}
              disabled={selectedImages.size === 0}
            >
              <CIcon icon={cilCloudDownload} className="me-2" />
              선택된 이미지 다운로드 ({selectedImages.size}개)
            </CButton>
          )}
        </div>
      </CCardHeader>
      <CCardBody>
        <div
          className={`drop-area ${dragActive ? 'active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            multiple
            accept="image/*"
            onChange={handleFileInputChange}
          />
          <div className="upload-content">
            <CIcon icon={cilCloudUpload} size="3xl" className="mb-3" />
            <p className="mb-2">이미지를 드래그하거나 클릭하여 업로드</p>
            <p className="text-muted small">지원 형식: JPG, PNG, GIF (최대 10MB)</p>
          </div>
        </div>

        {uploadedImages.length > 0 && (
          <CRow className="mt-4">
            <CCol md={6}>
              <CCard>
                <CCardHeader>
                  <strong>원본 이미지</strong>
                </CCardHeader>
                <CCardBody>
                  <CTable>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>이미지</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {uploadedImages.map((image, index) => (
                        <CTableRow key={index}>
                          <CTableDataCell>
                            <div className="d-flex align-items-center">
                              <CIcon icon={cilImage} className="me-2" />
                              {image.fileName}
                            </div>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </CCardBody>
              </CCard>
            </CCol>

            <CCol md={6}>
              <CCard>
                <CCardHeader>
                  <strong>합성된 이미지</strong>
                </CCardHeader>
                <CCardBody>
                  {mergedImages.length > 0 ? (
                    <CTable>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>
                            <CFormCheck
                              checked={selectedImages.size === mergedImages.length}
                              onChange={toggleAllImages}
                            />
                          </CTableHeaderCell>
                          <CTableHeaderCell>이미지</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {mergedImages.map((image, index) => (
                          <CTableRow 
                            key={index}
                            className="cursor-pointer"
                            onClick={() => toggleImageSelection(image.id)}
                          >
                            <CTableDataCell onClick={(e) => e.stopPropagation()}>
                              <CFormCheck
                                checked={selectedImages.has(image.id)}
                                onChange={() => toggleImageSelection(image.id)}
                              />
                            </CTableDataCell>
                            <CTableDataCell>
                              <div className="d-flex align-items-center">
                                <CIcon icon={cilImage} className="me-2" />
                                {image.fileName}
                              </div>
                            </CTableDataCell>
                          </CTableRow>
                        ))}
                      </CTableBody>
                    </CTable>
                  ) : (
                    <div className="text-center text-muted py-4">
                      이미지를 합성하면 여기에 결과가 표시됩니다.
                    </div>
                  )}
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        )}
      </CCardBody>

      <style jsx>{`
        .drop-area {
          border: 2px dashed #ccc;
          border-radius: 8px;
          padding: 40px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background-color: #f8f9fa;
        }

        .drop-area:hover {
          border-color: #0d6efd;
          background-color: #f1f3f5;
        }

        .drop-area.active {
          border-color: #0d6efd;
          background-color: #e9ecef;
        }

        .upload-content {
          color: #6c757d;
        }

        .upload-content p {
          margin: 0;
        }

        .table-image {
          margin-top: 1rem;
        }

        .table-image td {
          vertical-align: middle;
        }

        .btn-group {
          margin-top: 1rem;
        }

        .btn-group .btn {
          margin-right: 0.5rem;
        }

        .preview-image {
          border-radius: 4px;
          object-fit: cover;
          border: 1px solid #dee2e6;
        }

        .cursor-pointer {
          cursor: pointer;
        }

        .cursor-pointer:hover {
          background-color: #f8f9fa;
        }
      `}</style>
    </CCard>
  )
}

export default ImageConvert 