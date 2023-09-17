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
    Link,
    FormControl,
    FormErrorMessage,
    Spacer
} from '@chakra-ui/react'; import { FiUser } from 'react-icons/fi';
import { useForm } from "react-hook-form";
import { loginUser } from '../api/auth';
import { useState } from 'react';
import { useToast } from '@chakra-ui/react'
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginComponent() {

    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const toast = useToast()
    const { login, user, isAccessTokenExpired } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!loading) return
        reset('')
    }, [loading])

    useEffect(() => {
        if (!user)
            return
        if (isAccessTokenExpired() === false);
        navigate('/dashboard')
    }, [user])

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            const result = await loginUser(data)
            toast({
                title: 'Sikeres bejelentkezés.',
                status: 'success',
                duration: 4000,
                isClosable: true,
            })
            login(result)
        } catch (error) {
            toast({
                title: 'Sikertelen bejelentkezés.',
                description: "Rossz e-mail címet vagy jelszót adott meg.",
                status: 'error',
                duration: 4000,
                isClosable: true,
            })
            reset()
        }
        setLoading(false)
    }

    return (
        <Center height="100vh">
            <Box p={4} borderWidth={1} borderRadius="md" shadow="md" width="400px">
                <Flex align="center" justify="center" flexDirection="column">
                    <FiUser size={48} color="teal" />
                    <Heading size="lg" mt={2} mb={4}>
                        Bejelentkezés
                    </Heading>
                </Flex>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={4}>
                        <FormControl isInvalid={errors.email}>
                            <Input  {...register("email", { required: true })} placeholder="E-mail" type="email" />
                            {errors.email ? <FormErrorMessage>Kérem adja meg az e-mail címét</FormErrorMessage> : ""}
                        </FormControl>
                        <FormControl isInvalid={errors.password}>
                            <Input {...register("password", { required: true })} type="password" placeholder="Jelszó" />
                            {errors.email ? <FormErrorMessage>Kérem adja meg a jelszavát</FormErrorMessage> : ""}

                        </FormControl>
                        <Stack direction={"row"}>
                            <Link href={"/register"} textAlign={"right"} >Nincs fiókja?</Link>
                            <Spacer />
                            <Link textAlign={"right"} >Elfelejtett jelszó?</Link>
                        </Stack>
                        <Button isLoading={loading} type="submit" colorScheme="teal">
                            Bejelentkezés
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
