const Contact = () => {
  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="text-center">
        <h1 className="text-4xl font-light mb-8">On the way too</h1>
      </div>
    </div>
  );
};

export default Contact;
{
  /*import { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 这里后期可连接后端API
    alert(`感谢留言！我们会尽快回复 ${formData.name}`);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-light mb-8">Contact</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-medium mb-4">联系方式</h2>
          <ul className="space-y-2">
            <li>Email: contact@example.com</li>
            <li>电话: +123 456 7890</li>
            <li>工作室地址: 台北市信义区</li>
          </ul>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block mb-1">姓名</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block mb-1">电子邮箱</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div>
            <label htmlFor="message" className="block mb-1">留言内容</label>
            <textarea
              id="message"
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              className="w-full p-2 border rounded"
              required
            ></textarea>
          </div>
          
          <button 
            type="submit" 
            className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
          >
            发送留言
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;*/
}
