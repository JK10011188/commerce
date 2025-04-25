import React, { useRef, useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CImage,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCloudUpload, cilPlus, cilTrash } from '@coreui/icons'
import { useProductStore } from '../../../../stores/useNaverStore'

const ProductImageUploader = ({ productId }) => {
  const fileInputRef = useRef(null);
  const { products, setProduct, mainProduct, setMainProduct } = useProductStore();
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const isMainProduct = productId === mainProduct?.id;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' && selectedImage) {
        handleImageRemove(selectedImage);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage]);

  const product = products.find(p => p.id === productId);
  const images = product.additionalImages || [];

  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return;
    if(!isMainProduct && files.length > 1) {
      alert('대표 이미지 1개만 업로드할 수 있습니다.');
      return;
    }
    const filesToProcess = Array.from(files).slice(0, 10 - images.length);
    if (filesToProcess.length === 0) {
      alert('상품 이미지는 최대 10개까지 업로드할 수 있습니다.');
      return;
    }

    const newImages = [];
    
    for (const [idx, file] of filesToProcess.entries()) {
      if (!file.type.match('image.*')) {
        alert('이미지 파일만 업로드 가능합니다.');
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('파일 크기는 10MB를 초과할 수 없습니다.');
        continue;
      }

      try {
        const imageId = Date.now() + idx;
        const preview = URL.createObjectURL(file);
        
        // 파일을 Base64로 변환
        // const base64Data = await convertToBase64(file);
        
        newImages.push({
          id: imageId,
          file: file, // Base64 데이터 저장
          preview: preview,
          name: file.name,
          order: images.length + newImages.length + 1,
          isMain: images.length === 0 && newImages.length === 0
        });
      } catch (error) {
        console.error('이미지 처리 중 오류 발생:', error);
        alert('이미지 처리 중 오류가 발생했습니다.');
      }
    }

    if (newImages.length > 0) {
      const product = products.find(p => p.id === productId);
      setProduct({
        ...product,
        additionalImages: [...images, ...newImages]
      });
      setDragActive(false);
    }
  };

  const handleImageRemove = (imageId) => {
    const imageToRemove = images.find(img => img.id === imageId);
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
    const updatedImages = images
      .filter(img => img.id !== imageId)
      .map((img, index) => ({ ...img, order: index + 1 }));
    
    // 첫 번째 이미지를 대표 이미지로 설정
    const reorderedImages = updatedImages.map((img, index) => ({
      ...img,
      isMain: index === 0
    }));
    
    const product = products.find(p => p.id === productId);
    setProduct({
      ...product,
      additionalImages: reorderedImages
    });
    
    if (selectedImage === imageId) {
      setSelectedImage(null);
    }
  };

  const handleImageSelect = (imageId) => {
    if (selectedImage && selectedImage !== imageId) {
      const sourceImage = images.find(img => img.id === selectedImage);
      const targetImage = images.find(img => img.id === imageId);
      if (sourceImage && targetImage) {
        const sourceOrder = sourceImage.order;
        const targetOrder = targetImage.order;
        const updatedImages = images.map(img => {
          if (img.id === selectedImage) return { ...img, order: targetOrder };
          if (img.id === imageId) return { ...img, order: sourceOrder };
          return img;
        }).sort((a, b) => a.order - b.order);

        // 대표 이미지와 다른 이미지가 바뀌면 해당 이미지가 대표가 됨
        const reorderedImages = updatedImages.map(img => ({
          ...img,
          isMain: img.order === 1
        }));

        const product = products.find(p => p.id === productId);
        setProduct({...product, additionalImages: reorderedImages});
      }
      setSelectedImage(null);
    } else if (selectedImage === imageId) {
      setSelectedImage(null);
    } else {
      setSelectedImage(imageId);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleImageUpload(e.target.files);
      e.target.value = '';
    }
  };

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <strong>상품 이미지</strong>
      </CCardHeader>
      <CCardBody>
        {images.length === 0 ? (
          <div 
            className="detail-image-upload-area"
            onClick={() => fileInputRef.current.click()}
            onDragEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(false);
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleImageUpload(e.dataTransfer.files);
              }
            }}
          >
            <div className="upload-icon">
              <CIcon icon={cilCloudUpload} size="3xl" />
            </div>
            <div className="upload-text">
              <p>여기에 이미지를 드래그하거나 클릭하여 업로드</p>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                multiple={isMainProduct}
                accept="image/*"
                onChange={handleFileInput}
              />
              <p className="mt-2 text-muted">지원 형식: JPG, PNG, GIF (최대 10MB)</p>
            </div>
          </div>
        ) : (
          <div 
            className="detail-images-container"
            onDragEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(false);
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleImageUpload(e.dataTransfer.files);
              }
            }}
          >
            {images.map(image => (
              <div key={image.id} 
                className={`detail-image-item ${selectedImage === image.id ? 'selected' : ''} ${image.isMain ? 'main-image' : ''}`}
                onClick={() => handleImageSelect(image.id)}
                onDoubleClick={() => handleImageRemove(image.id)}
                draggable="false"
                onDragStart={(e) => e.preventDefault()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => e.preventDefault()}
              >
                <div className="image-order">
                  {image.isMain ? '' : images.filter(img => !img.isMain).findIndex(img => img.id === image.id) + 1}
                </div>
                <CImage rounded thumbnail src={image.preview} width={130} height={130} alt={image.name} draggable="false" />
                {image.isMain && (
                  <div className="main-image-badge">대표</div>
                )}
              </div>
            ))}
            {images.length < 10 && isMainProduct &&(
              <div className="add-detail-image-btn" onClick={() => fileInputRef.current.click()}>
                <CIcon icon={cilPlus} size="xl" />
                <div>이미지 추가</div>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  multiple
                  accept="image/*"
                  onChange={handleFileInput}
                />
              </div>
            )}
          </div>
        )}
      </CCardBody>
    </CCard>
  );
};

export default ProductImageUploader; 