import {
    Box,
    Button,
    Center,
    Flex,
    Heading,
    IconButton,
    Stack,
    Text,
    useColorMode,
    useToast
} from '@chakra-ui/react'; import { FiUser } from 'react-icons/fi';
import { useForm } from "react-hook-form";
import { registerUser } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import InputComponent from '../components/InputComponent';
import { object, ref, string } from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import { RegisterRequest } from '../interfaces/interfaces';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

export default function RegisterPage() {

    const toast = useToast()
    const navigate = useNavigate()

    const { user, isAccessTokenExpired } = useAuth()

    const { toggleColorMode, colorMode } = useColorMode()

    useEffect(() => {
        if (!user)
            return
        if (isAccessTokenExpired!() === false)
            navigate('/dashboard')
    }, [user])

    const { t, ready } = useTranslation()


    const validationSchema = object({
        firstName: string().required(t('register.label_first_name_error')),
        lastName: string().required(t('register.label_last_name_error')),
        password: string()
            .required(t('register.label_password_error'))
            .min(8, t('register.label_password_error_length')),
        confirmPassword: string()
            .required(t('register.label_password_error'))
            .oneOf([ref("password")], t('register.label_password_error_not_match')),
        email: string().required(t('register.label_email_error'))
    });

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterRequest>({ resolver: yupResolver(validationSchema) });

    const onSubmit = async (data: RegisterRequest) => {
        try {
            await registerUser(data)
            toast({
                title: 'Sikeres regisztráció.',
                status: 'success',
                duration: 4000,
                isClosable: true,
            })
            setTimeout(() => {
                navigate('/')
            }, 1000)
        } catch (error) {
            toast({
                title: 'Sikertelen regisztráció.',
                status: 'error',
                duration: 4000,
                isClosable: true,
            })
        }
    }


    if (ready)
        return (
            <Center height="100vh">
                <IconButton position={"absolute"} right={"10"} top={"5"} aria-label="Change theme" onClick={toggleColorMode} icon={colorMode === 'light' ? <FaSun /> : <FaMoon />} />
                <Box p={4} borderWidth={1} borderRadius="md" shadow="md" width="400px">
                    <Flex align="center" justify="center" flexDirection="column">
                        <FiUser size={48} color="teal" />
                        <Heading size="lg" mt={2} mb={4}>
                            {t('register.label_register')}
                        </Heading>
                    </Flex>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Stack spacing={4}>
                            <InputComponent
                                error={Boolean(errors.email)}
                                placeholder={t('register.label_email')}
                                errorMessage={errors.email?.message}
                                name='email'
                                register={register}
                                required={true}
                                type='email'
                            />
                            <InputComponent
                                error={Boolean(errors.password)}
                                placeholder={t('register.label_password')}
                                errorMessage={errors.password?.message}
                                name='password'
                                register={register}
                                required={true}
                                type='password'
                            />
                            <InputComponent
                                error={Boolean(errors.confirmPassword)}
                                placeholder={t('register.label_password')}
                                errorMessage={errors.confirmPassword?.message}
                                name='confirmPassword'
                                register={register}
                                required={true}
                                type='password'
                            />
                            <InputComponent
                                error={Boolean(errors.lastName)}
                                placeholder={t('register.label_last_name')}
                                errorMessage={errors.lastName?.message}
                                name='lastName'
                                register={register}
                                required={true}
                            />
                            <InputComponent
                                error={Boolean(errors.firstName)}
                                placeholder={t('register.label_first_name')}
                                errorMessage={errors.firstName?.message}
                                name='firstName'
                                register={register}
                                required={true}
                            />
                            <Link to="/">
                                <Text _hover={{ textDecoration: "underline" }} textAlign={"right"}>{t('register.label_back_to_login')}</Text>
                            </Link>
                            <Button isLoading={isSubmitting} type="submit" colorScheme="teal">
                                {t('register.label_create_account')}
                            </Button>
                        </Stack>
                    </form>
                    <Box mt={4} textAlign="center">
                        <Text fontSize="sm">{t('register.label_app_name')}</Text>
                        <Text fontSize="xs" color="gray.500">v1.0</Text>
                    </Box>
                </Box>
            </Center>
        )
}
