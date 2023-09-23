import React from 'react'
import {
    Box,
    Button,
    Center,
    Flex,
    Heading,
    Input,
    Stack,
    Text,
    FormControl,
    FormErrorMessage,
    useToast
} from '@chakra-ui/react'; import { FiUser } from 'react-icons/fi';
import { useForm } from "react-hook-form";
import { registerUser } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

export default function RegisterComponent() {

    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const toast = useToast()
    const navigate = useNavigate()

    const onSubmit = async (data) => {
        try {
            await registerUser(data)
            toast({
                title: 'Sikeres regisztráció.',
                description: "Mindjárt átirányítunk a főoldalra...",
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
                description: "Már regisztrált e-mail címet adott meg vagy túl rövid a jelszava.",
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
                        <FormControl isInvalid={errors.email}>
                            <Input  {...register("email", { required: true })} placeholder="E-mail" type="email" />
                            {errors.email ? <FormErrorMessage>Kérem adja meg az e-mail címét</FormErrorMessage> : ""}
                        </FormControl>
                        <FormControl isInvalid={errors.password}>
                            <Input {...register("password", {
                                required: true, minLength: 6
                            })} type="password" placeholder="Jelszó" />
                            {errors.password && errors.password.type === 'required' ? <FormErrorMessage>Kérem adja meg a jelszavát</FormErrorMessage> : ""}
                            {errors.password && errors.password.type === 'minLength' ? <FormErrorMessage>Jelszó hossza minimum 6 karakter</FormErrorMessage> : ""}
                            {errors.password && errors.password.type === 'validate' ? <FormErrorMessage>Mindkét jelszónak meg kell egyeznie</FormErrorMessage> : ""}
                        </FormControl>
                        <FormControl isInvalid={errors.confirmPassword}>
                            <Input {...register("confirmPassword", {
                                required: true, minLength: 6, validate: (val) => {
                                    if (watch('password') != val) {
                                        return "Mindkét megadott jelszónak egyeznie kell.";
                                    }
                                }
                            })} type="password" placeholder="Jelszó újra" />
                            {errors.confirmPassword && errors.confirmPassword.type === 'required' ? <FormErrorMessage>Kérem adja meg a jelszavát</FormErrorMessage> : ""}
                            {errors.confirmPassword && errors.confirmPassword.type === 'minLength' ? <FormErrorMessage>Jelszó hossza minimum 6 karakter</FormErrorMessage> : ""}
                            {errors.confirmPassword && errors.confirmPassword.type === 'validate' ? <FormErrorMessage>Mindkét jelszónak meg kell egyeznie</FormErrorMessage> : ""}
                        </FormControl>
                        <FormControl isInvalid={errors.lastName}>
                            <Input {...register("lastName", { required: true })} type="text" placeholder="Vezetéknév" />
                            {errors.lastName ? <FormErrorMessage>Kérem adja meg a vezetéknevét</FormErrorMessage> : ""}
                        </FormControl>
                        <FormControl isInvalid={errors.firstName}>
                            <Input {...register("firstName", { required: true })} type="text" placeholder="Keresztnév" />
                            {errors.firstName ? <FormErrorMessage>Kérem adja meg a keresztnevét</FormErrorMessage> : ""}
                        </FormControl>
                        <Link to="/">
                            <Text _hover={{ textDecoration: "underline" }} textAlign={"right"}>Vissza a bejelentkezéshez</Text>
                        </Link>
                        <Button type="submit" colorScheme="teal">
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
