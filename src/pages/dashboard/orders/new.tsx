import React, { useState } from 'react';
import { useRouter } from 'next/router';
import useSession from '@/lib/useSession';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Phone, MessageSquare, ImageIcon, Upload } from 'lucide-react';

const NewOrder: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orderType, setOrderType] = useState<'appointment' | 'description' | 'image_upload' | null>(null);
  const [description, setDescription] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [measurements, setMeasurements] = useState({
    topLength: '', shoulder: '', sleeveLength: '', chest: '', tummy: '', neck: '', muscle: '',
    trouserLength: '', waist: '', thigh: '', hip: '', knee: '', trouserBase: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === 'loading' || !session?.user || session.user.role !== 'customer') {
    router.push('/login');
    return null;
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setImages((prev) => [...prev, ...Array.from(e.target.files!)]);
  };

  const removeImage = (index: number) => setImages(images.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const orderData = {
      customerId: session.user?.id ?? '',
      status: 'pending' as const,
      order_type: orderType,
      description: orderType === 'description' ? description : undefined,
      appointment_date_time: orderType === 'appointment' ? `${appointmentDate}T${appointmentTime}:00Z` : undefined,
      measurements: (orderType === 'description' || orderType === 'image_upload') && Object.values(measurements).some(v => !!v)
        ? measurements
        : undefined,
      image_urls: orderType === 'image_upload' ? images.map((img, i) => `/uploads/${Date.now()}-${i}-${img.name}`) : undefined,
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.user.accessToken}`,
        },
        body: JSON.stringify(orderData),
      });
      if (!res.ok) throw new Error(await res.text() || 'Order creation failed');
      router.push('/dashboard/customer?new=true');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    if (!orderType) return false;
    switch (orderType) {
      case 'appointment':
        return !!appointmentDate && !!appointmentTime;
      case 'description':
        return description.length >= 10 && Object.values(measurements).some(v => !!v);
      case 'image_upload':
        return images.length > 0 && Object.values(measurements).some(v => !!v);
      default:
        return false;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-lg h-full p-4">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Menu</h2>
        <nav>
          <ul className="space-y-2">
            <li><Link href="/dashboard/customer" className="text-gray-600 hover:text-gray-800">My Orders</Link></li>
            <li><Link href="/dashboard/profile" className="text-gray-600 hover:text-gray-800">Profile</Link></li>
            <li><Link href="/dashboard/settings" className="text-gray-600 hover:text-gray-800">Settings</Link></li>
            <li><button onClick={() => signOut({ callbackUrl: '/' })} className="text-gray-600 hover:text-gray-800">Logout</button></li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Order</h1>
          {error && <p className="text-red-500 mb-6">{error}</p>}
          {!orderType ? (
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg cursor-pointer" onClick={() => setOrderType('appointment')}>
                <CardContent className="p-6 text-center">
                  <Phone className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">Book Consultation</h3>
                  <p className="text-gray-500 mt-2">Schedule a personalized fitting</p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg cursor-pointer" onClick={() => setOrderType('description')}>
                <CardContent className="p-6 text-center">
                  <MessageSquare className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">Describe Your Vision</h3>
                  <p className="text-gray-500 mt-2">Detail your design ideas</p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg cursor-pointer" onClick={() => setOrderType('image_upload')}>
                <CardContent className="p-6 text-center">
                  <ImageIcon className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">Upload Reference</h3>
                  <p className="text-gray-500 mt-2">Share inspiration images</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>
                  {orderType === 'appointment' ? 'Book Your Consultation' : orderType === 'description' ? 'Describe Your Design' : 'Upload References'}
                </CardTitle>
                <Button variant="outline" onClick={() => setOrderType(null)} className="mt-2">
                  Change Option
                </Button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {orderType === 'appointment' && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <input
                        type="date"
                        value={appointmentDate}
                        onChange={(e) => setAppointmentDate(e.target.value)}
                        className="p-2 border rounded"
                        required
                      />
                      <select
                        value={appointmentTime}
                        onChange={(e) => setAppointmentTime(e.target.value)}
                        className="p-2 border rounded"
                        required
                      >
                        <option value="">Select Time (GMT)</option>
                        {['09:00', '10:00', '13:00', '14:00', '15:00'].map((time) => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {(orderType === 'description' || orderType === 'image_upload') && (
                    <>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe your attire in detail (min 10 characters)..."
                        className="w-full p-2 border rounded"
                        rows={4}
                        required={orderType === 'description'}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(measurements).map(([key, value]) => (
                          <input
                            key={key}
                            type="number"
                            placeholder={`${key.replace(/([A-Z])/g, ' $1').trim()} (cm)`}
                            value={value}
                            onChange={(e) => setMeasurements({ ...measurements, [key]: e.target.value })}
                            className="p-2 border rounded"
                          />
                        ))}
                      </div>
                    </>
                  )}
                  {orderType === 'image_upload' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Upload Images</label>
                      <div className="flex flex-wrap gap-2">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="imageUpload"
                        />
                        <label htmlFor="imageUpload" className="flex items-center gap-2 p-2 bg-blue-500 text-white rounded cursor-pointer">
                          <Upload /> Upload
                        </label>
                        {images.map((img, i) => (
                          <div key={i} className="relative">
                            <img src={URL.createObjectURL(img)} alt={`Upload ${i + 1}`} className="w-20 h-20 object-cover rounded" />
                            <Button variant="outline" onClick={() => removeImage(i)} className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white">
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <Button
                    type="submit"
                    disabled={!isFormValid() || isSubmitting}
                    variant="outline"
                    className="w-full mt-4"
                  >
                    {isSubmitting ? 'Submitting...' : 'Create Order'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default NewOrder;