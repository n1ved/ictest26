import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const CERT_WIDTH_PX = 2000;
const CERT_HEIGHT_PX = 1414;

const renderCertificateCanvas = async (element) => {
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

  return html2canvas(element, {
    width: CERT_WIDTH_PX,
    height: CERT_HEIGHT_PX,
    scale: 1,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    logging: false,
    imageTimeout: 10000,
    removeContainer: true
  });
};

export const generateCertificateImage = async (element, fileName = 'certificate') => {
  try {
    const canvas = await renderCertificateCanvas(element);

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

export const generateCertificatePdfBlob = async (element) => {
  try {
    const canvas = await renderCertificateCanvas(element);
    const imgData = canvas.toDataURL('image/png', 1.0);

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [CERT_WIDTH_PX, CERT_HEIGHT_PX]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, CERT_WIDTH_PX, CERT_HEIGHT_PX, undefined, 'FAST');
    return pdf.output('blob');
  } catch (error) {
    console.error('Error generating certificate PDF:', error);
    throw error;
  }
};

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

export const downloadCertificateAsPdf = async (element, fileName = 'certificate') => {
  try {
    const blob = await generateCertificatePdfBlob(element);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading certificate PDF:', error);
    throw error;
  }
};



export const uploadCertificateToSupabase = async (supabase, userId, type, fileBlob, options = {}) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseName = `certificate_${userId}_${type}_${timestamp}`;
    const ext = options.ext || 'pdf';
    const contentType = options.contentType || 'application/pdf';
    
    // Upload file with timeout
    const uploadPromise = supabase.storage
      .from('certificates')
      .upload(`${baseName}.${ext}`, fileBlob, {
        contentType,
        upsert: true
      });
    
    const { data: fileData, error: fileError } = await Promise.race([
      uploadPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Image upload timeout')), 20000))
    ]);
    
    if (fileError) {
      console.error('File upload error:', fileError);
      throw fileError;
    }
    
    // Get public URL
    const { data: fileUrl } = supabase.storage
      .from('certificates')
      .getPublicUrl(fileData.path);
    
    return {
      fileUrl: fileUrl.publicUrl,
      filePath: fileData.path
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