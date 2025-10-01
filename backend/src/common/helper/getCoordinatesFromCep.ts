interface AwesomeapiInterface {
  cep: string;
  address_type: string;
  address_name: string;
  address: string;
  state: string;
  district: string;
  lat: string;
  lng: string;
  city: string;
  city_ibge: number;
  ddd: number;
}

export async function getCoordinatesFromZipCode(
  zipcode?: string,
): Promise<AwesomeapiInterface | null> {
  if (!zipcode) return null;

  try {
    const response = await fetch(
      `https://cep.awesomeapi.com.br/json/${zipcode}`,
    );

    if (!response.ok) {
      console.error(
        `Erro na API AwesomeAPI para o CEP ${zipcode}: ${response.status}`,
      );
      return null;
    }

    const data = (await response.json()) as AwesomeapiInterface;

    // Verifica se os dados necessários (CEP, Lat, Lng) estão presentes
    if (data && data.cep && data.lat && data.lng) {
      return data;
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar coordenadas da API de CEP:', error);
    return null;
  }
}
