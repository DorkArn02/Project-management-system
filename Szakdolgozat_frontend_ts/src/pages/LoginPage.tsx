import { Box, Button, Center, Flex, Heading, IconButton, Spacer, Stack, Text, useColorMode, useToast } from "@chakra-ui/react";
import { FiUser } from "react-icons/fi"
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form"
import { loginUser } from "../api/auth";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";
import InputComponent from "../components/InputComponent";
import { LoginRequest } from "../interfaces/interfaces";
import { FaMoon, FaSun } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export default function LoginPage() {

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<LoginRequest>();

    const toast = useToast()

    const navigate = useNavigate()

    const { user, isAccessTokenExpired, login } = useAuth()

    const { toggleColorMode, colorMode } = useColorMode()

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

    const { t, ready } = useTranslation()

    if (ready)
        return (
            <Center height="100vh">
                <IconButton position={"absolute"} right={"10"} top={"5"} aria-label="Change theme" onClick={toggleColorMode} icon={colorMode === 'light' ? <FaSun /> : <FaMoon />} />
                <Box p={4} borderWidth={1} borderRadius="md" shadow="md" width="400px">
                    <Flex align="center" justify="center" flexDirection="column">
                        <FiUser size={48} color="teal" />
                        <Heading size="lg" mt={2} mb={4}>
                            {t('login.label_login')}
                        </Heading>
                    </Flex>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Stack spacing={4}>
                            <InputComponent
                                type="email"
                                errorMessage={t('login.label_email_error')}
                                error={Boolean(errors.email)}
                                name="email"
                                required={true}
                                register={register}
                                placeholder={t('login.label_email')}
                            />
                            <InputComponent
                                type="password"
                                errorMessage={t('login.label_password_error')}
                                error={Boolean(errors.password)}
                                name="password"
                                required={true}
                                register={register}
                                placeholder={t('login.label_password')}
                            />
                            <Stack direction={"row"}>
                                <Link to={"/register"} >
                                    <Text textAlign={"right"} _hover={{ textDecoration: "underline" }}>
                                        {t('login.label_question')}
                                    </Text>
                                </Link>
                                <Spacer />
                                <Text>{t('login.label_forgotten_pwd')}</Text>
                            </Stack>
                            <Button isLoading={isSubmitting} type="submit" colorScheme="teal">
                                {t('login.label_login')}
                            </Button>
                        </Stack>
                    </form>
                    <Box mt={4} textAlign="center">
                        <Text fontSize="sm">{t('login.label_app_name')}</Text>
                        <Text fontSize="xs" color="gray.500">v1.0</Text>
                    </Box>
                </Box>
            </Center>
        )
}
