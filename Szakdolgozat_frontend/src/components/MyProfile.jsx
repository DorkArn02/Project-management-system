import React from 'react'
import { Flex, Breadcrumb, Stack, BreadcrumbItem, BreadcrumbLink, FormErrorMessage, Heading, Text, Button, FormControl, Input, FormLabel } from "@chakra-ui/react"
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import moment from 'moment'
import { useForm } from 'react-hook-form'
import { changePassword } from '../api/user'

export default function MyProfile() {

    const { user } = useAuth()
    const { register, handleSubmit, watch, formState: { errors } } = useForm();

    const handlePasswordChange = async (object) => {
        const result = await changePassword(object)

        console.log(result)
    }

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
                            <FormControl isInvalid={errors.oldPassword}>
                                <FormLabel>Régi jelszó</FormLabel>
                                <Input {...register("oldPassword", { required: true })} type="password" />
                                {errors.oldPassword ? <FormErrorMessage>Kérem adja meg a régi jelszavát.</FormErrorMessage> : ""}
                            </FormControl>
                            <FormControl isInvalid={errors.password1}>
                                <FormLabel>Új jelszó</FormLabel>
                                <Input {...register("password1", { required: true, minLength: 6 })} type="password" />
                                {errors.password1 && errors.password1.type === 'required' ? <FormErrorMessage>Kérem adja meg a jelszavát</FormErrorMessage> : ""}
                                {errors.password1 && errors.password1.type === 'minLength' ? <FormErrorMessage>Jelszó hossza minimum 6 karakter</FormErrorMessage> : ""}
                                {errors.password1 && errors.password1.type === 'validate' ? <FormErrorMessage>Mindkét jelszónak meg kell egyeznie</FormErrorMessage> : ""}
                            </FormControl>
                            <FormControl isInvalid={errors.password2}>
                                <FormLabel>Új jelszó újra</FormLabel>
                                <Input {...register("password2", {
                                    required: true, validate: (val) => {
                                        if (watch('password1') != val) {
                                            return "Mindkét megadott jelszónak egyeznie kell.";
                                        }
                                    }
                                })} type="password" />
                                {errors.password2 && errors.password2.type === 'required' ? <FormErrorMessage>Kérem adja meg az új jelszavát mégegyszer.</FormErrorMessage> : ""}
                                {errors.password2 && errors.password2.type === 'minLength' ? <FormErrorMessage>Jelszó hossza minimum 6 karakter</FormErrorMessage> : ""}
                                {errors.password2 && errors.password2.type === 'validate' ? <FormErrorMessage>Mindkét jelszónak meg kell egyeznie</FormErrorMessage> : ""}
                            </FormControl>
                            <Button colorScheme='blue' type="submit">Megváltoztatás</Button>
                        </Stack>
                    </form>

                </Flex>
            </Flex>
        </>
    )
}
