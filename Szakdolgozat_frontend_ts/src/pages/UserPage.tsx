import { Flex, Breadcrumb, Select, Stack, BreadcrumbItem, BreadcrumbLink, Heading, Text, Button, useToast, FormControl, FormLabel } from "@chakra-ui/react"
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
import { useTranslation } from "react-i18next"

export default function UserPage() {

    const { user } = useAuth()

    const toast = useToast()
    const { t, ready, i18n } = useTranslation()

    const validationSchema = object({
        oldPassword: string()
            .required(t('users.label_old_password_error')),
        password1: string()
            .required(t('users.label_new_password_error'))
            .min(8, t('users.label_password_short')),
        password2: string()
            .required(t('users.label_new_password_again_error'))
            .oneOf([ref("password1")], t('users.label_passwords_not_match')),
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

    const languageOptions = [
        { label: "Magyar", value: "hu" },
        { label: "English", value: "en" }
    ]

    const handleLanguageChange = (value: string) => {
        i18n.changeLanguage(value)
        localStorage.setItem('language', value)
        toast({
            title: t('users.label_language_changed', { lang: value }),
            status: 'success',
            duration: 4000,
            isClosable: true,
        })
    }


    if (user && ready)
        return (
            <Flex direction={["column", "column", "row"]} gap={"100px"}>
                <Flex gap={"20px"} flexDirection={"column"} mt={5}>
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <BreadcrumbLink as={Link} to='/dashboard'>{t('dashboard.dashboard_title')}</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbItem isCurrentPage>
                            <BreadcrumbLink href='/dashboard/myprofile'>{t('users.label_details')}</BreadcrumbLink>
                        </BreadcrumbItem>
                    </Breadcrumb>
                    <Flex w={"full"} gap={4} direction={"column"}>
                        <Heading size="lg" mb={2}>{t('users.label_details')}</Heading>
                        <Stack gap={3}>
                            <Text>UID: {user.id}</Text>
                            <Text>{`${t('users.label_full_name')}: ${user.lastName} ${user.firstName}`}</Text>
                            <Text>{`${t('users.label_email')}: ${user.email}`}</Text>
                            <Text>{t('users.label_register')}: {moment(user.registered).format("yyyy/MM/DD")}</Text>
                        </Stack>
                        <Heading size="lg">{t('users.label_settings')}</Heading>
                        <form onSubmit={handleSubmit(handlePasswordChange)}>
                            <Stack gap={3}>
                                <InputComponent
                                    variant={"filled"}
                                    name="oldPassword"
                                    register={register}
                                    error={Boolean(errors.oldPassword)}
                                    errorMessage={errors.oldPassword?.message}
                                    label={t('users.label_old_password')}
                                    placeholder={t('users.label_old_password')}
                                    required={true}
                                    type="password"
                                />
                                <InputComponent
                                    variant={"filled"}
                                    name="password1"
                                    register={register}
                                    error={Boolean(errors.password1)}
                                    errorMessage={errors.password1?.message}
                                    label={t('users.label_new_password')}
                                    placeholder={t('users.label_new_password')}
                                    required={true}
                                    type="password"
                                />
                                <InputComponent
                                    variant={"filled"}
                                    name="password2"
                                    register={register}
                                    error={Boolean(errors.password2)}
                                    errorMessage={errors.password2?.message}
                                    label={t('users.label_new_password_again')}
                                    placeholder={t('users.label_new_password_again')}
                                    required={true}
                                    type="password"
                                />

                                <Button isLoading={isSubmitting} colorScheme='blue' type="submit">{t('users.label_change')}</Button>
                            </Stack>
                        </form>
                    </Flex>
                </Flex>
                <Flex mt={"65px"} direction={"column"}>
                    <Heading size="lg">Nyelvi beállítások</Heading>
                    <FormControl>
                        <FormLabel>{t('users.label_user_language')}</FormLabel>
                        <Select onChange={(e) => handleLanguageChange(e.target.value)} defaultValue={i18n.language}>
                            {languageOptions.map((i, k) => {
                                return <option value={i.value} key={k}>{i.label}</option>
                            })}
                        </Select>
                    </FormControl>
                </Flex>
            </Flex>
        )
}
