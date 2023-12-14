import { Box, Button, Center, Flex, Heading, Spacer, Stack, Text, useToast } from "@chakra-ui/react";
import { FiUser } from "react-icons/fi"
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form"
import { loginUser } from "../api/auth";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";
import InputComponent from "../components/InputComponent";
import { LoginRequest } from "../interfaces/interfaces";

export default function LoginPage() {

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<LoginRequest>();

    const toast = useToast()

    const navigate = useNavigate()

    const { user, isAccessTokenExpired, login } = useAuth()

    useEffect(() => {
        if (user) {
            if (isAccessTokenExpired!() === false) {
                navigate('/dashboard')
            }
            return
        }
    }, [user])

    const onSubmit = async (data: LoginRequest) => {
        try {
            const result = await loginUser(data)
            toast({
                title: 'Sikeres bejelentkezés.',
                status: 'success',
                duration: 4000,
                isClosable: true,
            })
            login!(result)
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
                        <InputComponent
                            type="email"
                            errorMessage={"Kérem adja meg az e-mail címét."}
                            error={Boolean(errors.email)}
                            name="email"
                            required={true}
                            register={register}
                            placeholder="E-mail"
                        />
                        <InputComponent
                            type="password"
                            errorMessage={"Kérem adja meg a jelszavát."}
                            error={Boolean(errors.password)}
                            name="password"
                            required={true}
                            register={register}
                            placeholder="Jelszó"
                        />
                        <Stack direction={"row"}>
                            <Link to={"/register"} >
                                <Text textAlign={"right"} _hover={{ textDecoration: "underline" }}>
                                    Nincs fiókja?
                                </Text>
                            </Link>
                            <Spacer />
                            <Text>Elfelejtett jelszó?</Text>
                        </Stack>
                        <Button isLoading={isSubmitting} type="submit" colorScheme="teal">
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
