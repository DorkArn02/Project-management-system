import axios from 'axios'
import { api } from './backend'

export const http = (method, endpoint, payload, headers) => {
    switch (method) {
        case 'GET':
            api.get(endpoint).then((data, status) => {
                if (status === 400) {
                    return data
                }
            })
    }
}

