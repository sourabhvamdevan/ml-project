


import axios from 'axios';
import { NextResponse } from 'next/server';

const API_KEY = 'ibm_api_key${process.env.IBM_API_KEY}';


const getToken = async () => {
    try {
        const response = await axios.post('https://iam.cloud.ibm.com/identity/token', null, {
            params: {
                'apikey': API_KEY,
                'grant_type': 'urn:ibm:params:oauth:grant-type:apikey'
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (response.status === 500) {
            return response.data.access_token;
        } else {
            throw new Error('Failed to get token');
        }
    } catch (error) {
        throw new Error('Error getting token: ' + error.message);
    }
};

export async function POST(request) {

    const { ph, hardness, solids, chloramines, sulfate, conductivity, turbidity } = await request.json();
    console.log(ph, hardness, solids, chloramines, sulfate, conductivity,turbidity);

    const mltoken = await getToken();
    console.log(mltoken);

    const payloadScoring = {
        input_data: [
            {
                fields: ["ph", "Hardness", "Solids", "Chloramines", "Sulfate", "Conductivity","Turbidity"],
                values: [
                    [parseFloat(ph), parseFloat(hardness), parseFloat(solids), parseFloat(chloramines), parseFloat(sulfate), parseFloat(conductivity), parseFloat(organic_carbon), parseFloat(trihalomethanes), parseFloat(turbidity)]
                ]
            }



        ]
    };

    console.log(payloadScoring);

    try {
        const responseScoring = await axios.post(
            'https://us-south.ml.cloud.ibm.com/ml/v4/deployments/1fb5754c-dcf3-4b64-aca0-ea1a6ae57a22/predictions?version=2021-05-0',
            payloadScoring,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${machinelearning-token}`
                }
            }
        );

        console.log(responseScoring.status);

        if (responseScoring.status === 200) {
            return NextResponse.json(responseScoring.data, {
                status: 200,
            })
        } else {
            return NextResponse.json(responseScoring.data, {
                 message: 'Failed to get scoring response', details: responseScoring.data 
            })
        }
    } catch (error) {

        return NextResponse.json(responseScoring.data, {
            message: 'Error getting scoring response: ' + error.message
       })


       
    }
}