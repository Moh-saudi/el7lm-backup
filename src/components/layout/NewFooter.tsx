'use client';

import React from 'react';
import { 
  Group, 
  Text, 
  Stack,
  Button,
  Divider,
  Box
} from '@mantine/core';
import { 
  Heart,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NewFooter() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { label: 'الرئيسية', href: '/' },
    { label: 'عن المنصة', href: '/about' },
    { label: 'الخدمات', href: '/services' },
    { label: 'الأسئلة الشائعة', href: '/faq' },
    { label: 'سياسة الخصوصية', href: '/privacy' },
    { label: 'شروط الاستخدام', href: '/terms' },
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Youtube, href: '#', label: 'Youtube' },
  ];

  const contactInfo = [
    { icon: Mail, text: 'info@el7lm.com' },
    { icon: Phone, text: '+966 50 123 4567' },
    { icon: MapPin, text: 'الرياض، المملكة العربية السعودية' },
  ];

  return (
    <Box className="bg-gray-900 text-white border-t-0">
      <Box className="p-8">
        <Group justify="space-between" align="flex-start" className="mb-8">
          {/* معلومات المنصة */}
          <Stack gap="md" className="flex-1 max-w-md">
            <Text size="xl" fw={700} className="text-blue-400">
              El7lm
            </Text>
            <Text size="sm" className="text-gray-300 leading-relaxed">
              منصة شاملة لإدارة كرة القدم واللاعبين والأندية. نساعد في تطوير المواهب 
              وإدارة الفرق وتحسين الأداء الرياضي.
            </Text>
            
            {/* معلومات التواصل */}
            <Stack gap="xs">
              {contactInfo.map((item, index) => (
                <Group key={index} gap="xs" className="text-gray-300">
                  <item.icon size={16} />
                  <Text size="sm">{item.text}</Text>
                </Group>
              ))}
            </Stack>
          </Stack>

          {/* الروابط السريعة */}
          <Stack gap="md" className="flex-1 max-w-xs">
            <Text size="lg" fw={600} className="text-white">
              روابط سريعة
            </Text>
            <Stack gap="xs">
              {footerLinks.map((link, index) => (
                <Button
                  key={index}
                  variant="subtle"
                  color="gray"
                  size="sm"
                  className="text-right justify-start p-0 h-auto"
                  onClick={() => router.push(link.href)}
                >
                  {link.label}
                </Button>
              ))}
            </Stack>
          </Stack>

          {/* وسائل التواصل الاجتماعي */}
          <Stack gap="md" className="flex-1 max-w-xs">
            <Text size="lg" fw={600} className="text-white">
              تابعنا
            </Text>
            <Group gap="xs">
              {socialLinks.map((social, index) => (
                <Button
                  key={index}
                  variant="light"
                  size="sm"
                  radius="xl"
                  className="bg-gray-800 hover:bg-gray-700 border-gray-600"
                  onClick={() => window.open(social.href, '_blank')}
                >
                  <social.icon size={16} />
                </Button>
              ))}
            </Group>
          </Stack>
        </Group>

        <Divider className="border-gray-700 my-6" />

        {/* حقوق النشر */}
        <Group justify="space-between" align="center">
          <Text size="sm" className="text-gray-400">
            © {currentYear} El7lm. جميع الحقوق محفوظة.
          </Text>
          <Group gap="xs" className="text-gray-400">
            <Text size="sm">صنع بـ</Text>
            <Heart size={16} className="text-red-500" />
            <Text size="sm">في المملكة العربية السعودية</Text>
          </Group>
        </Group>
      </Box>
    </Box>
  );
}
