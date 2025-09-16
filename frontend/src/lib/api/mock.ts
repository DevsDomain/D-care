
import { 
    Caregiver, 
    Elder, 
    Booking, 
    Review, 
    IvcfResult, 
    IvcfQuestion,
    User,
    SearchFilters,
    BookingStatus,
    ApiResponse,
    PaginatedResponse,
    NotificationMessage
  } from '../types';
  
  // Simulate API delay
  const delay = (ms: number = 800) => new Promise(resolve => setTimeout(resolve, ms));
  
  // Mock data
  const mockCaregivers: Caregiver[] = [
    {
      id: '1',
      name: 'Maria Santos',
      photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
      verified: true,
      crmCorem: 'CRM-SP 123456',
      rating: 4.9,
      reviewCount: 127,
      distanceKm: 2.5,
      skills: ['Elderly Care', 'Medical Administration', 'Mobility Assistance', 'Companionship'],
      experience: '8+ years',
      priceRange: 'R$ 30-40/hora',
      emergency: true,
      availability: [
        { start: '08:00', end: '17:00', day: 'monday' },
        { start: '08:00', end: '17:00', day: 'tuesday' },
        { start: '08:00', end: '17:00', day: 'wednesday' },
      ],
      bio: 'Experienced caregiver specializing in elderly care with medical background. Fluent in Portuguese and Spanish.',
      phone: '+55 11 99999-0001',
      languages: ['Portuguese', 'Spanish'],
      specializations: ['Alzheimer', 'Diabetes', 'Post-surgery Care'],
      verificationBadges: ['CRM', 'Background Check', 'First Aid Certified']
    },
    {
      id: '2',
      name: 'Ana Oliveira',
      photo: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face',
      verified: true,
      crmCorem: 'COREM-RJ 789012',
      rating: 4.7,
      reviewCount: 89,
      distanceKm: 4.2,
      skills: ['Physical Therapy', 'Medication Management', 'Meal Preparation'],
      experience: '6+ years',
      priceRange: 'R$ 35-45/hora',
      emergency: false,
      availability: [
        { start: '06:00', end: '14:00', day: 'monday' },
        { start: '06:00', end: '14:00', day: 'wednesday' },
        { start: '06:00', end: '14:00', day: 'friday' },
      ],
      bio: 'Licensed nurse with specialization in geriatric care. Passionate about improving quality of life for elderly patients.',
      phone: '+55 11 99999-0002',
      languages: ['Portuguese', 'English'],
      specializations: ['Hypertension', 'Physical Rehabilitation', 'Dementia Care'],
      verificationBadges: ['COREM', 'Background Check', 'First Aid Certified']
    },
    {
      id: '3',
      name: 'Carlos Silva',
      photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
      verified: false,
      rating: 4.3,
      reviewCount: 34,
      distanceKm: 6.8,
      skills: ['Companionship', 'Light Housekeeping', 'Transportation'],
      experience: '3+ years',
      priceRange: 'R$ 25-30/hora',
      emergency: false,
      availability: [
        { start: '14:00', end: '22:00', day: 'tuesday' },
        { start: '14:00', end: '22:00', day: 'thursday' },
        { start: '09:00', end: '17:00', day: 'saturday' },
      ],
      bio: 'Dedicated caregiver focused on providing emotional support and companionship to elderly clients.',
      phone: '+55 11 99999-0003',
      languages: ['Portuguese'],
      specializations: ['Social Interaction', 'Daily Activities'],
      verificationBadges: ['Background Check']
    }
  ];
  
  const mockElders: Elder[] = [
    {
      id: '1',
      name: 'José da Silva',
      age: 78,
      photo: 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=150&h=150&fit=crop&crop=face',
      conditions: ['Diabetes', 'Hypertension', 'Mild Dementia'],
      medications: ['Metformin', 'Losartan', 'Donepezil'],
      emergencyContact: {
        name: 'Maria da Silva',
        phone: '+55 11 98888-0001',
        relation: 'Daughter'
      },
      address: {
        street: 'Rua das Flores, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567'
      },
      preferences: {
        gender: 'female',
        language: ['Portuguese'],
        specialNeeds: ['Diabetes management', 'Memory care']
      },
      createdAt: '2024-01-15T10:00:00Z'
    }
  ];
  
  const mockBookings: Booking[] = [
    {
      id: '1',
      caregiverId: '1',
      elderId: '1',
      dateISO: '2024-09-10T09:00:00Z',
      duration: 4,
      status: 'accepted',
      emergency: false,
      notes: 'Regular morning care routine, medication reminder at 10 AM',
      address: {
        street: 'Rua das Flores, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567'
      },
      totalPrice: 140,
      services: ['Personal Care', 'Medication Management', 'Companionship'],
      createdAt: '2024-09-08T14:30:00Z',
      updatedAt: '2024-09-08T15:00:00Z'
    },
    {
      id: '2',
      caregiverId: '2',
      elderId: '1',
      dateISO: '2024-09-12T14:00:00Z',
      duration: 3,
      status: 'completed',
      emergency: false,
      address: {
        street: 'Rua das Flores, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567'
      },
      totalPrice: 120,
      services: ['Physical Therapy', 'Meal Preparation'],
      createdAt: '2024-09-10T10:00:00Z',
      updatedAt: '2024-09-12T17:00:00Z',
      completedAt: '2024-09-12T17:00:00Z'
    }
  ];
  
  const mockReviews: Review[] = [
    {
      id: '1',
      bookingId: '2',
      caregiverId: '2',
      elderName: 'José da Silva',
      rating: 5,
      comment: 'Ana was exceptional! Very professional and caring. My father felt comfortable throughout the session.',
      createdAt: '2024-09-12T18:00:00Z',
      helpfulCount: 8,
      services: ['Physical Therapy', 'Meal Preparation']
    },
    {
      id: '2',
      bookingId: '1',
      caregiverId: '1',
      elderName: 'José da Silva',
      rating: 5,
      comment: 'Maria is wonderful! She has been taking care of my father for months now and he really likes her.',
      createdAt: '2024-09-09T16:30:00Z',
      helpfulCount: 12,
      services: ['Personal Care', 'Medication Management']
    }
  ];
  
  const mockIvcfQuestions: IvcfQuestion[] = [
    {
      id: 'q1',
      category: 'instrumental',
      question: 'Consegue usar o telefone?',
      description: 'Avaliar a capacidade de utilizar o telefone de forma independente',
      options: [
        { value: 2, label: 'Utiliza por iniciativa própria', description: 'Liga e atende sem ajuda' },
        { value: 1, label: 'Disca alguns números conhecidos', description: 'Precisa de auxílio ocasional' },
        { value: 0, label: 'Atende mas não liga', description: 'Não consegue discar números' }
      ]
    },
    {
      id: 'q2',
      category: 'instrumental',
      question: 'Consegue ir a locais distantes usando algum transporte?',
      description: 'Avaliar a capacidade de se locomover independentemente',
      options: [
        { value: 2, label: 'Viaja sozinho(a)', description: 'Usa transporte público ou dirige' },
        { value: 1, label: 'Viaja acompanhado(a)', description: 'Precisa de companhia' },
        { value: 0, label: 'Não viaja', description: 'Não sai de casa' }
      ]
    },
    {
      id: 'q3',
      category: 'instrumental',
      question: 'Consegue fazer compras?',
      options: [
        { value: 2, label: 'Faz compras independentemente' },
        { value: 1, label: 'Compra pequenas coisas' },
        { value: 0, label: 'Precisa ser acompanhado(a)' }
      ]
    },
    // Add more questions...
  ];
  
  // Mock current user
  const mockUser: User = {
    id: 'user1',
    name: 'Maria da Silva',
    email: 'maria@email.com',
    phone: '+55 11 98888-0001',
    role: 'family',
    photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bb?w=150&h=150&fit=crop&crop=face',
    createdAt: '2024-01-01T00:00:00Z',
    preferences: {
      notifications: true,
      emailUpdates: true,
      emergencyAlerts: true
    },
    elders: mockElders
  };
  
  // API Functions
  export const mockApi = {
    // Authentication (placeholder)
    async login(email: string, password: string): Promise<ApiResponse<User>> {
      await delay(1000);
      return {
        success: true,
        data: mockUser,
        message: 'Login successful'
      };
    },
  
    async register(userData: Partial<User>): Promise<ApiResponse<User>> {
      await delay(1200);
      return {
        success: true,
        data: { ...mockUser, ...userData },
        message: 'Registration successful'
      };
    },
  
    // Caregivers
    async searchCaregivers(filters?: SearchFilters): Promise<ApiResponse<PaginatedResponse<Caregiver>>> {
      await delay(600);
      let filteredCaregivers = [...mockCaregivers];
      
      if (filters?.verified) {
        filteredCaregivers = filteredCaregivers.filter(c => c.verified);
      }
      
      if (filters?.emergency) {
        filteredCaregivers = filteredCaregivers.filter(c => c.emergency);
      }
      
      if (filters?.distanceKm) {
        filteredCaregivers = filteredCaregivers.filter(c => c.distanceKm <= filters.distanceKm!);
      }
      
      if (filters?.rating) {
        filteredCaregivers = filteredCaregivers.filter(c => c.rating >= filters.rating!);
      }
  
      return {
        success: true,
        data: {
          data: filteredCaregivers,
          total: filteredCaregivers.length,
          page: 1,
          limit: 10,
          hasMore: false
        }
      };
    },
  
    async getCaregiverById(id: string): Promise<ApiResponse<Caregiver>> {
      await delay(400);
      const caregiver = mockCaregivers.find(c => c.id === id);
      
      if (!caregiver) {
        return {
          success: false,
          error: 'Caregiver not found'
        };
      }
  
      return {
        success: true,
        data: caregiver
      };
    },
  
    async getCaregiverReviews(caregiverId: string): Promise<ApiResponse<Review[]>> {
      await delay(500);
      const reviews = mockReviews.filter(r => r.caregiverId === caregiverId);
      
      return {
        success: true,
        data: reviews
      };
    },
  
    // Bookings
    async createBooking(bookingData: Partial<Booking>): Promise<ApiResponse<Booking>> {
      await delay(800);
      const newBooking: Booking = {
        id: Date.now().toString(),
        status: 'requested',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...bookingData as Booking
      };
  
      return {
        success: true,
        data: newBooking,
        message: 'Booking request sent successfully'
      };
    },
  
    async getBookings(userId: string): Promise<ApiResponse<Booking[]>> {
      await delay(500);
      const bookingsWithDetails = mockBookings.map(booking => ({
        ...booking,
        caregiver: mockCaregivers.find(c => c.id === booking.caregiverId),
        elder: mockElders.find(e => e.id === booking.elderId)
      }));
  
      return {
        success: true,
        data: bookingsWithDetails
      };
    },
  
    async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<ApiResponse<Booking>> {
      await delay(600);
      const booking = mockBookings.find(b => b.id === bookingId);
      
      if (!booking) {
        return {
          success: false,
          error: 'Booking not found'
        };
      }
  
      const updatedBooking = {
        ...booking,
        status,
        updatedAt: new Date().toISOString(),
        ...(status === 'completed' && { completedAt: new Date().toISOString() })
      };
  
      return {
        success: true,
        data: updatedBooking,
        message: `Booking ${status} successfully`
      };
    },
  
    // IVCF-20 Assessment
    async getIvcfQuestions(): Promise<ApiResponse<IvcfQuestion[]>> {
      await delay(400);
      return {
        success: true,
        data: mockIvcfQuestions
      };
    },
  
    async submitIvcfAssessment(elderId: string, answers: Record<string, number>): Promise<ApiResponse<IvcfResult>> {
      await delay(1000);
      
      // Calculate score (simplified)
      const totalScore = Object.values(answers).reduce((sum, value) => sum + value, 0);
      const maxPossible = mockIvcfQuestions.length * 2;
      const percentage = (totalScore / maxPossible) * 100;
      
      let category: 'independent' | 'at-risk' | 'frail';
      let tips: string[];
      
      if (percentage >= 80) {
        category = 'independent';
        tips = [
          'Continue with regular physical activities',
          'Maintain social connections',
          'Keep up with hobbies and interests'
        ];
      } else if (percentage >= 60) {
        category = 'at-risk';
        tips = [
          'Consider additional support for daily activities',
          'Regular health check-ups recommended',
          'Social activities to prevent isolation'
        ];
      } else {
        category = 'frail';
        tips = [
          'Professional care assistance recommended',
          'Safety modifications needed at home',
          'Regular medical monitoring required'
        ];
      }
  
      const result: IvcfResult = {
        id: Date.now().toString(),
        elderId,
        score: totalScore,
        category,
        tips,
        recommendations: [
          'Schedule regular medical check-ups',
          'Consider home safety assessment',
          'Evaluate need for additional support services'
        ],
        answers,
        completedAt: new Date().toISOString(),
        validUntil: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString() // 6 months
      };
  
      return {
        success: true,
        data: result,
        message: 'Assessment completed successfully'
      };
    },
  
    // Reviews
    async createReview(reviewData: Partial<Review>): Promise<ApiResponse<Review>> {
      await delay(700);
      const newReview: Review = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        helpfulCount: 0,
        ...reviewData as Review
      };
  
      return {
        success: true,
        data: newReview,
        message: 'Review submitted successfully'
      };
    },
  
    // AI Guide (mocked responses)
    async askAiGuide(question: string): Promise<ApiResponse<{ answer: string; sources: string[] }>> {
      await delay(1500); // Longer delay to simulate AI processing
      
      const responses = [
        {
          answer: "Para cuidados com idosos diabéticos, é essencial monitorar regularmente os níveis de glicose, seguir uma dieta balanceada rica em fibras e baixa em açúcares simples, e garantir que a medicação seja tomada nos horários corretos. Também é importante manter atividades físicas leves e regulares, como caminhadas.",
          sources: ["Manual de Cuidados Diabéticos", "Diretrizes SBD 2024"]
        },
        {
          answer: "A segurança domiciliar para idosos inclui: instalar barras de apoio no banheiro, melhorar a iluminação em corredores e escadas, remover tapetes soltos, manter medicamentos organizados e de fácil acesso, e ter números de emergência visíveis.",
          sources: ["Guia de Segurança Domiciliar", "ANVISA - Cuidados Domiciliares"]
        },
        {
          answer: "Sinais de alerta que requerem atenção médica imediata incluem: confusão mental súbita, dificuldade para respirar, dor no peito, quedas com ferimentos, vômitos persistentes, ou qualquer mudança significativa no comportamento habitual do idoso.",
          sources: ["Manual de Emergências Geriátricas", "Protocolo de Urgências"]
        }
      ];
  
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  
      return {
        success: true,
        data: randomResponse
      };
    },
  
    // User Profile
    async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
      await delay(600);
      const updatedUser = { ...mockUser, ...userData };
      
      return {
        success: true,
        data: updatedUser,
        message: 'Profile updated successfully'
      };
    },
  
    // Elder management
    async createElder(elderData: Partial<Elder>): Promise<ApiResponse<Elder>> {
      await delay(800);
      const newElder: Elder = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        ...elderData as Elder
      };
  
      return {
        success: true,
        data: newElder,
        message: 'Elder profile created successfully'
      };
    },
  
    async updateElder(elderId: string, elderData: Partial<Elder>): Promise<ApiResponse<Elder>> {
      await delay(600);
      const elder = mockElders.find(e => e.id === elderId);
      
      if (!elder) {
        return {
          success: false,
          error: 'Elder profile not found'
        };
      }
  
      const updatedElder = { ...elder, ...elderData };
  
      return {
        success: true,
        data: updatedElder,
        message: 'Elder profile updated successfully'
      };
    }
  };
  
  // Export individual functions for cleaner imports
  export const {
    login,
    register,
    searchCaregivers,
    getCaregiverById,
    getCaregiverReviews,
    createBooking,
    getBookings,
    updateBookingStatus,
    getIvcfQuestions,
    submitIvcfAssessment,
    createReview,
    askAiGuide,
    updateProfile,
    createElder,
    updateElder
  } = mockApi;