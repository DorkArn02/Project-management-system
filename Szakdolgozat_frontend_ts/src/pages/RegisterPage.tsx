import {
    Box,
    Button,
    Center,
    Flex,
    Heading,
    Stack,
    Text,
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

export default function RegisterPage() {

    const toast = useToast()
    const navigate = useNavigate()

    const { user, isAccessTokenExpired } = useAuth()

    useEffect(() => {
        if (!user)
            return
        if (isAccessTokenExpired!() === false)
            navigate('/dashboard')
    }, [user])


    const validationSchema = object({
        firstName: string().required("Kérem adja meg a keresztnevét."),
        lastName: string().required("Kérem adja meg a vezetéknevét."),
        password: string()
            .required("Kérem adja meg a jelszavát.")
            .min(8, "A jelszó hosszúság minimum 8 karakter."),
        confirmPassword: string()
            .required("Kérem adja meg a jelszavát újra.")
            .oneOf([ref("password")], "A jelszavak nem egyeznek."),
        email: string().required("Kérem adja meg az e-mail címét.")
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
            }, 2000)
        } catch (error) {
            toast({
                title: 'Sikertelen regisztráció.',
                status: 'error',
                duration: 4000,
                isClosable: true,
            })
        }
    }

    return (
        <Center height="100vh">
            <Box p={4} borderWidth={1} borderRadius="md" shadow="md" width="400px">
                <Flex align="center" justify="center" flexDirection="column">
                    <FiUser size={48} color="teal" />
                    <Heading size="lg" mt={2} mb={4}>
                        Regisztráció
                    </Heading>
                </Flex>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={4}>
                        <InputComponent
                            error={Boolean(errors.email)}
                            placeholder='E-mail'
                            errorMessage={errors.email?.message}
                            name='email'
                            register={register}
                            required={true}
                            type='email'
                        />
                        <InputComponent
                            error={Boolean(errors.password)}
                            placeholder='Jelszó'
                            errorMessage={errors.password?.message}
                            name='password'
                            register={register}
                            required={true}
                            type='password'
                        />
                        <InputComponent
                            error={Boolean(errors.confirmPassword)}
                            placeholder='Jelszó'
                            errorMessage={errors.confirmPassword?.message}
                            name='confirmPassword'
                            register={register}
                            required={true}
                            type='password'
                        />
                        <InputComponent
                            error={Boolean(errors.lastName)}
                            placeholder='Vezetéknév'
                            errorMessage={errors.lastName?.message}
                            name='lastName'
                            register={register}
                            required={true}
                        />
                        <InputComponent
                            error={Boolean(errors.firstName)}
                            placeholder='Keresztnév'
                            errorMessage={errors.firstName?.message}
                            name='firstName'
                            register={register}
                            required={true}
                        />
                        <Link to="/">
                            <Text _hover={{ textDecoration: "underline" }} textAlign={"right"}>Vissza a bejelentkezéshez</Text>
                        </Link>
                        <Button isLoading={isSubmitting} type="submit" colorScheme="teal">
                            Fiók létrehozása
                        </Button>
                    </Stack>
                </form>
                <Box mt={4} textAlign="center">
                    <Text fontSize="sm">Projektmenedzsment alkalmazás</Text>
                    <Text fontSize="xs" color="gray.500">v1.0</Text>
                </Box>
            </Box>
        </Center>
    )
}
