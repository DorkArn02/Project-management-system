import { Flex, Breadcrumb, Stack, BreadcrumbItem, BreadcrumbLink, Heading, Text, Button, useToast } from "@chakra-ui/react"
import { Link } from 'react-router-dom'
import moment from 'moment'
import { useForm } from 'react-hook-form'
import { changePassword } from '../api/user'
import { PasswordChangeRequest } from "../interfaces/interfaces"
import { useAuth } from "../contexts/AuthContext"
import InputComponent from "../components/InputComponent"
import { object, ref, string } from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import { useMutation } from "@tanstack/react-query"

export default function UserPage() {

    const { user } = useAuth()

    const toast = useToast()

    const validationSchema = object({
        oldPassword: string()
            .required("Kérem adja meg a régi jelszavát."),
        password1: string()
            .required("Kérem adja meg a jelszavát.")
            .min(8, "A jelszó hosszúság minimum 8 karakter."),
        password2: string()
            .required("Kérem adja meg a jelszavát újra.")
            .oneOf([ref("password1")], "A jelszavak nem egyeznek."),
    });

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<PasswordChangeRequest>({
        resolver: yupResolver(validationSchema)
    });

    const mutation = useMutation({
        mutationKey: ['changeUserPassword'],
        mutationFn: (object: PasswordChangeRequest) => changePassword(object)
    })

    const handlePasswordChange = async (object: PasswordChangeRequest) => {
        await mutation.mutateAsync(object, {
            onSuccess: () => {
                toast({
                    title: 'Sikeres jelszó változtatás.',
                    status: 'success',
                    duration: 4000,
                    isClosable: true,
                })
                reset()
            },
            onError() {
                toast({
                    title: 'Hiba.',
                    description: "Jelszó változtatása sikertelen.",
                    status: 'error',
                    duration: 4000,
                    isClosable: true,
                })
                reset()
            },
        })
    }
    if (user)
        return (
            <>
                <Flex gap={"20px"} flexDirection={"column"} mt={5}>
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <BreadcrumbLink as={Link} to='/dashboard'>Áttekintő</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbItem isCurrentPage>
                            <BreadcrumbLink href='/dashboard/myprofile'>Saját fiók</BreadcrumbLink>
                        </BreadcrumbItem>
                    </Breadcrumb>
                    <Flex w={"full"} gap={4} direction={"column"}>
                        <Heading size="lg" mb={2}>Fiók adatok</Heading>
                        <Stack gap={3}>
                            <Text>UID: {user.id}</Text>
                            <Text>Teljes név:{user.lastName + " " + user.firstName} </Text>
                            <Text>Email cím: {user.email}</Text>
                            <Text>Regisztrálás időpontja: {moment(user.registered).format("yyyy/MM/DD")}</Text>
                        </Stack>
                        <Heading size="lg">Beállítások</Heading>
                        <form onSubmit={handleSubmit(handlePasswordChange)}>
                            <Stack gap={3}>
                                <InputComponent
                                    variant={"filled"}
                                    name="oldPassword"
                                    register={register}
                                    error={Boolean(errors.oldPassword)}
                                    errorMessage={errors.oldPassword?.message}
                                    label="Régi jelszó"
                                    placeholder="Régi jelszó"
                                    required={true}
                                    type="password"
                                />
                                <InputComponent
                                    variant={"filled"}
                                    name="password1"
                                    register={register}
                                    error={Boolean(errors.password1)}
                                    errorMessage={errors.password1?.message}
                                    label="Új jelszó"
                                    placeholder="Új jelszó"
                                    required={true}
                                    type="password"
                                />
                                <InputComponent
                                    variant={"filled"}
                                    name="password2"
                                    register={register}
                                    error={Boolean(errors.password2)}
                                    errorMessage={errors.password2?.message}
                                    label="Új jelszó mégegyszer"
                                    placeholder="Új jelszó mégegyszer"
                                    required={true}
                                    type="password"
                                />

                                <Button isLoading={isSubmitting} colorScheme='blue' type="submit">Megváltoztatás</Button>
                            </Stack>
                        </form>

                    </Flex>
                </Flex>
            </>
        )
}
