import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const generateCertificateImage = async (element, fileName = 'certificate') => {
  try {
    // Wait for images to load before capturing
    const images = element.getElementsByTagName('img');
    const imagePromises = Array.from(images).map(img => {
      if (img.complete) {
        return Promise.resolve();
      }
      return new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
    });
    
    await Promise.all(imagePromises);
    
    const canvas = await html2canvas(element, {
      width: 2000, // Match template width exactly
      height: 1414, // Match template height exactly
      scale: 1, // No scaling needed since we match template size
      useCORS: true,
      allowTaint: false,
      backgroundColor: 'transparent', // Keep transparent background
      logging: false,
      imageTimeout: 10000,
      removeContainer: true
    });

    // Convert canvas to PNG blob with high quality to match template
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png', 1.0); // High quality PNG to match template quality
    });
  } catch (error) {
    console.error('Error generating certificate image:', error);
    throw error;
  }
};

// PDF generation removed - only generating PNG certificates now

export const downloadCertificateFromUrl = async (imageUrl, fileName = 'certificate') => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading certificate:', error);
    throw error;
  }
};

export const downloadCertificateAsImage = async (element, fileName = 'certificate') => {
  try {
    const blob = await generateCertificateImage(element, fileName);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading certificate:', error);
    throw error;
  }
};



export const uploadCertificateToSupabase = async (supabase, userId, type, imageBlob) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseName = `certificate_${userId}_${type}_${timestamp}`;
    
    // Upload image with timeout
    const imageUploadPromise = supabase.storage
      .from('certificates')
      .upload(`${baseName}.png`, imageBlob, {
        contentType: 'image/png',
        upsert: true
      });
    
    const { data: imageData, error: imageError } = await Promise.race([
      imageUploadPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Image upload timeout')), 20000))
    ]);
    
    if (imageError) {
      console.error('Image upload error:', imageError);
      throw imageError;
    }
    
    // Get public URL
    const { data: imageUrl } = supabase.storage
      .from('certificates')
      .getPublicUrl(imageData.path);
    
    return {
      imageUrl: imageUrl.publicUrl,
      imagePath: imageData.path
    };
    
  } catch (error) {
    console.error('Error uploading certificate to Supabase:', error);
    throw error;
  }
};

export const createCertificateRecord = async (supabase, certificateData) => {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .insert([certificateData])
      .select();
    
    if (error) throw error;
    return data[0];
    
  } catch (error) {
    console.error('Error creating certificate record:', error);
    throw error;
  }
};

export const getCertificatesForUser = async (supabase, userId) => {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
    
  } catch (error) {
    console.error('Error fetching certificates:', error);
    throw error;
  }
};

export const getAllCertificates = async (supabase) => {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select(`
        *,
        login:user_id(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
    
  } catch (error) {
    console.error('Error fetching all certificates:', error);
    throw error;
  }
};