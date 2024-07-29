import { Button, Form, Input, notification } from 'antd';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

import { SvgIcon } from '@/components/icon';
import { ReturnButton } from './components/ReturnButton';
import { LoginStateEnum, useLoginStateContext } from './providers/LoginStateProvider';

const apiUrl = import.meta.env.VITE_API_URL;

function ResetForm() {
  const { t } = useTranslation();
  const { loginState, backToLogin } = useLoginStateContext();

  const onFinish = async (values: any) => {
    try {
      const resetdata = {
        email: values.email,
        password: 'string',
      };

      const response = await axios.put(`${apiUrl}/Login/Forgotpassword`, resetdata);

      if (response.status === 200) {
        notification.success({ message: 'Reset password link sent to your email' });
      } else {
        notification.error({ message: 'Failed to send reset password link' });
      }
    } catch (error) {
      console.error('Error in sending reset password request:', error);
      notification.error({ message: 'Error', description: error.message, duration: 2 });
    }
  };

  if (loginState !== LoginStateEnum.RESET_PASSWORD) return null;

  return (
    <>
      <div className="mb-8 text-center">
        <SvgIcon icon="ic-reset-password" size="100" />
      </div>
      <div className="mb-4 text-center text-2xl font-bold xl:text-3xl">
        {t('sys.login.forgetFormTitle')}
      </div>
      <Form name="normal_login" size="large" initialValues={{ remember: true }} onFinish={onFinish}>
        <p className="mb-4 h-14 text-center text-gray">{t('sys.login.forgetFormSecondTitle')}</p>
        <Form.Item
          name="email"
          rules={[{ required: true, message: t('sys.login.emaildPlaceholder') }]}
        >
          <Input placeholder={t('sys.login.email')} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" className="w-full">
            {t('sys.login.sendEmailButton')}
          </Button>
        </Form.Item>
        <ReturnButton onClick={backToLogin} />
      </Form>
    </>
  );
}

export default ResetForm;
