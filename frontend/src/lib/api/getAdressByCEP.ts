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

export async function getAdressByCEP(cep: string):Promise<AwesomeapiInterface | null> {
  
  console.log("CEP utilizado",cep);

  const response = await fetch( `https://cep.awesomeapi.com.br/json/${cep}`);

  if (!response.ok) {
    throw new Error("Erro ao registrar idoso");
  }

  return response.json();
}
