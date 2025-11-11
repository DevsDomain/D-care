// src/lib/api/getAdressByCEP.ts
/**
 * Busca endereço por CEP na AwesomeAPI.
 * Retorna null se CEP inválido ou se a API não encontrar.
 */
export async function getAdressByCEP(cepRaw: string) {
  const cep = String(cepRaw || "").replace(/\D/g, "");

  // Só consulta se tiver 8 dígitos
  if (cep.length !== 8) return null;

  const url = `https://cep.awesomeapi.com.br/json/${cep}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      // 404 comum quando CEP não existe
      return null;
    }

    const data = await res.json();

    // Normaliza campos que variam por API
    return {
      address: data.address || data.street || data.logradouro || "",
      city: data.city || data.city_name || data.localidade || "",
      state: data.state || data.state_id || data.uf || "",
      cep: data.cep || cep,
    };
  } catch {
    // Falha de rede etc.: não quebra o fluxo do usuário
    return null;
  }
}
