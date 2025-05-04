
import axios from 'axios';
import { useRole } from '@/contexts/RoleContext';


// Configure axios with base URL
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Add interceptor to include auth token in requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } 
  return config;
});

export interface Patient{
  patient_id: string;
  login_id: string;
  fname: string;
  lname: string;
  id_number: string;
  sex: string;
  date_of_birth: string;
  address: string;
  phone: string;
  email: string;
  blood_type: string;
}

export interface AvailableDoctors {
  id: number;
  name: string;
  speciality: string;
  phone: string;
  email: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  role: 'admin' | 'patient' | 'doctor' | 'pharmacist';
}

export interface LoginResponse {
  access_token: string;
  name: string;
  surname: string;
  role: 'admin' | 'patient' | 'doctor' | 'pharmacist';
}

export interface Appointment {
  appointment_id: number;
  type: string;
  start_time: any; // ISO8601 timestamp
  end_time: any; // ISO8601 timestamp
  status: string;
  doctor_name: string;
}

export interface AppointmentRequest {
  type: string;
  start_time: any; // ISO8601 timestamp
  end_time: any; // ISO8601 timestamp
  doctor_name: string;
}

export interface AppointmentResponse {
  status: string;
}

export interface Prescription {
  id: string;
  code: string;
  medication: string;
  dosage: string;
  patient: string;
  doctor: string;
  pharmacist: string;
  prescription_date: string;
  status: string;
  instruction: string;
  date_filled: string;
  refills_remaining: number;
  date_prescribed: string;
}

export interface Medication {
  id: number;
  name: string;
  ingredients: string;
  in_stock: number;
}

export interface PatientRecord {
  patient_record_id: string
  id: string;
  name: string;
  surname: string;
  type: string;
  description: string;
  details: string;
  date: string;
  doctor: string;
  treatment?: {
    treatment_date: string;
    treatment_description: string;
    diagnosis: string;
    follow_up_date?: string;
  };
}

// Login API endpoint
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    const response = await api.post<LoginResponse>('/login', credentials);
    
    // Store the token in localStorage
    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('user_role', response.data.role);
    localStorage.setItem('name', response.data.name);
    localStorage.setItem('surname', response.data.surname);
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new Error('Invalid credentials');
    }
    throw new Error('Login failed');
  }
};

// GET appointments API endpoint
export const getAppointments = async (): Promise<Appointment[]> => {
  try {
    const response = await api.get<Appointment[]>('/get_appointments');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch appointments:', error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized. Please log in again.');
      }
      if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      }
    }
    throw new Error('Failed to fetch appointments');
  }
};

// GET prescriptions API endpoint
export const getPrescriptions = async (): Promise<Prescription[]> => {
  try {
    const response = await api.get<Prescription[]>('/get_prescriptions');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch prescriptions:', error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized. Please log in again.');
      }
      if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      }
    }
    throw new Error('Failed to fetch prescriptions');
  }
};

// GET prescription API endpoint
export const getPrescription = async (id: number): Promise<Prescription> => {
  try {
    const response = await api.get<Prescription>(`/get_prescription/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch prescription:', error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized. Please log in again.');
      }
      if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      }
    }
    throw new Error('Failed to fetch prescription');
  }
};

// GET prescriptions for pharmacist API endpoint
export const getPharmacistPrescriptions = async (): Promise<Prescription[]> => {
  try {
    const response = await api.get<Prescription[]>('/pharmacist/get_prescriptions');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch prescriptions:', error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized. Please log in again.');
      }
      if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      }
    }
    throw new Error('Failed to fetch prescriptions');
  }
}


//PUT prescriptions API endpoint 
export const issuePrescription = async (id : string) => {
  try {
    const response = await api.put<Prescription>(`/issue_prescription/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to issue prescription:', error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized. Please log in again.');
      }
      if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      }
    }
    throw new Error('Failed to issue prescription');
  }
}

//GET medications API endpoint
export const getMedications = async (): Promise<Medication[]> => {
  try {
    const response = await api.get<Medication[]>('/get_medications');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch medications:', error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized. Please log in again.');
      }
      if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      }
    }
    throw new Error('Failed to fetch medications');
  }
}


// GET patient record API endpoint
export const getPatientRecord = async (): Promise<PatientRecord> => {
  try {
    const response = await api.get<PatientRecord>('/get_patient_record');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch patient record:', error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized. Please log in again.');
      }
      if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      }
    }
    throw new Error('Failed to fetch patient record');
  }
};

// GET patient record API endpoint
export const getPatientRecords = async (role: string): Promise<PatientRecord[]> => {
  try {
    const response = await api.get<PatientRecord[]>(`/get_patient_records/${role}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch patient record:', error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized. Please log in again.');
      }
      if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      }
    }
    throw new Error('Failed to fetch patient record');
  }
};

// GET doctor for appointment API endpoint
export const getDoctors = async (): Promise<AvailableDoctors[]> => {
  try {
    const response = await api.get('/get_doctors');
    const doctors: AvailableDoctors[] = response.data.map((doctor: any) => ({
      id: doctor.doctor_id,
      name: doctor.name,
      speciality: doctor.speciality,
      phone: doctor.phone,
      email: doctor.email,}));
    
    return doctors;

    return response.data;
  } catch (error) {
    console.error('Failed to fetch doctors:', error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized. Please log in again.');
      }
      if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      }
    }
    throw new Error('Failed to fetch doctors');
  }
};

// PUT appointment cancelled
export const cancelAppointment = async (id: number): Promise<void> => {
  try{
    const response = await api.put(`/cancel_appointment/${id}`);
    if (response.status !== 200) {
      throw new Error('Failed to cancel appointment');
    }

  } catch (error){
    console.error('Failed to cancel appointment:', error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized. Please log in again.');
      }
      if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      }
    }
    throw new Error('Failed to cancel appointment');
  }

}

// POST new appointment
export const scheduleAppointment = async(appointmentDetails) =>{
  try {
    const response = await api.post<AppointmentResponse>('/schedule_appointment', appointmentDetails);
    return response.data;
  } catch (error) {
    console.error('Failed to schedule appointment:', error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized. Please log in again.');
      }
      if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      }
    }
    throw new Error('Failed to schedule appointment');
  }
}

// GET user accounts API endpoint
export const getUserAccounts = async () => {
  try {
    const response = await api.get('/get_user_accounts');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user accounts:', error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized. Please log in again.');
      }
      if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      }
    }
    throw new Error('Failed to fetch user accounts');
  }
}

// GET user account API endpoint
export const getUserAccount = async (userId: string, role: string) => {
  try {
    const response = await api.get(`/get_user_account/${userId}`, { params: { role } });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user account:', error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized. Please log in again.');
      }
      if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      }
    }
    throw new Error('Failed to fetch user account');
  }
}

//DELETE user account API endpoint
export const deleteUserAccount = async (userId: string, role: string) => {
  try {
    const response = await api.delete(`/delete_user/${userId}`, { data: { role } });
    return response.data;
  } catch (error) {
    console.error('Failed to delete user account:', error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized. Please log in again.');
      }
      if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      }
    }
    throw new Error('Failed to delete user account');
  }
}

//ADD user account API endpoint
export const addUserAccount = async (userDetails: any) => {
  try {
    const response = await api.post('/add_user', userDetails);
    return response.data;
  } catch (error) {
    console.error('Failed to add user account:', error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized. Please log in again.');
      }
      if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      }
    }
    throw new Error('Failed to add user account');
  }
}

//UPDATE user account API endpoint
export const updateUserAccount = async (userId: string, userDetails: any) => {
  try {
    console.log(userId,userDetails)
    const response = await api.put(`/update_user/${userId}`, userDetails);
    return response.data;
  } catch (error) {
    console.error('Failed to update user account:', error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized. Please log in again.');
      }
      if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      }
    }
    throw new Error('Failed to update user account');
  }
}

export const createPatientRecord = async  (record: any) => {
  try {
    const response = await api.post('/create_record',record);
    return response.data;
  } catch (error) {
    console.error('Failed to create user record:', error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized. Please log in again.');
      }
      if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      }
    }
    throw new Error('Failed to Create a record for the user');
  }
}

export const getPatientById = async (id: string) =>{
  try {
    const response = await api.get(`/get_patient/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user account:', error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized. Please log in again.');
      }
      if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      }
    }
    throw new Error('Failed to fetch user account');
  }
}


export const getPatients = async () => {
  try {
    const response = await api.get(`/get_patients`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user account:', error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized. Please log in again.');
      }
      if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      }
    }
    throw new Error('Failed to fetch user account');
  }
}

async function logginManager(){
  const token = localStorage.getItem("access_token" )
  if(token){
    const response = await  axios.post("http://localhost:5000/api", {token:  token})
    
    if(response.status == 401){
      console.log("Not a valid token please login again")
      localStorage.clear();
    }
  }
}