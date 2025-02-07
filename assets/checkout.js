function uHeaders(){  
 if(!localStorage.as)
    window.location.href = '/account/logout';
  return 	{
    'Authorization':`Bearer ${ JSON.parse(atob(JSON.parse(localStorage.as).gbl)).access_token}`,
    'Content-Type':'application/json'
  };
}

  function tHeaders(){
    return 	{
            'Authorization':`Basic ${btoa(`79716b858c8c1a4fc9acdd3af6acdeb3c7cfc979:be70df962967ae1c995f91f5758845c5b348c660`)}`,
             'Content-Type':'application/json',
             'Accept': 'application/json',
          };
  } 

  function showSpinner() {
    document.getElementById('spinner').style.display = 'block';
  }

  function hideSpinner() {
      document.getElementById('spinner').style.display = 'none';
  }

  async function damePickup(param ) {
        showSpinner();
        const url = 'https://apicloud.farmacorp.com/apishopify/api/v2.0/order/instaleap/job/branchoffices/pickup';
        try {     
          
            const response = await fetch(url, {
                method: 'POST',
                headers: tHeaders(),
                body: JSON.stringify(param)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            hideSpinner();
            return data.data;
          
        } catch (error) {
            console.error('Error:', error);
            hideSpinner();
        }
  }

   async function fetchShippingRates(city) {
    showSpinner();
    const url = `https://apicloud.farmacorp.com/apishopify/api/v2.0/order/shipping/rates/${encodeURIComponent(city)}`;
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers:  tHeaders()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        hideSpinner();
        return data.data;
    } catch (error) {
        console.error('Error fetching shipping rates:', error);
    }
  }

   async function fetchShippingRatesExpreess() {
    showSpinner();
    const url = `https://apicloud.farmacorp.com/apishopify/api/v2.0/order/shipping/EnvioExpress`;
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers:  tHeaders()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        hideSpinner();
        return data.data;
    } catch (error) {
        console.error('Error fetching shipping rates:', error);
    }
  }

  async function createOrder(orderData) {
    showSpinner();
    const url = 'https://apicloud.farmacorp.com/apishopify/api/v2.0/order/create/sfe/multi';

    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Basic Nzk3MTZiODU4YzhjMWE0ZmM5YWNkZDNhZjZhY2RlYjNjN2NmYzk3OTpiZTcwZGY5NjI5NjdhZTFjOTk1ZjkxZjU3NTg4NDVjNWIzNDhjNjYw',
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers:  tHeaders(),
            body: JSON.stringify(orderData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();      
      //  hideSpinner();
        return data.data;
    } catch (error) {
        console.error('Error creating order:', error);
    }
}

async function upsertAddress(addressData) {

    showSpinner();
    console.log('addressData', addressData);
    const url = 'https://apicloud.farmacorp.com/apishopify/api/v1.0/customer/address/store';
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers:  tHeaders(),
            body: JSON.stringify(addressData),
        });

        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status}`);
        }

        const data = await response.json();
        console.log('data upsertAddress', data);
        hideSpinner();
        return data;
    } catch (error) {
        hideSpinner();
        console.error('Error al realizar la solicitud:', error);
    }
}

async function dameScheduled(param) {
    showSpinner();
    const url = 'https://apicloud.farmacorp.com/apishopify/api/v2.0/order/instaleap/job/availability/branchoffice/scheduled';
    try {
       const response = await fetch(url, {
                method: 'POST',
                headers: tHeaders(),
                body: JSON.stringify(param)
            });

        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status}`);
        }

        const data = await response.json();
       
        hideSpinner();

        return data.data;
    } catch (error) {
        hideSpinner();
        console.error('Error al realizar la solicitud:', error);
    }
}

async function dameExpress(param) {
    showSpinner();
    const url = 'https://apicloud.farmacorp.com/apishopify/api/v2.0/order/instaleap/job/availability/branchoffice/express';
    try {
       const response = await fetch(url, {
                method: 'POST',
                headers: tHeaders(),
                body: JSON.stringify(param)
            });

        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status}`);
        }

        const data = await response.json();
       
        hideSpinner();
        return data.data;
    } catch (error) {
        hideSpinner();
        console.error('Error al realizar la solicitud:', error);
    }
}

async function validateCobertura(latitud, longitud, ciudad) {
  const url = "https://apicloud.farmacorp.com/apishopify/api/v2.0/order/validate/cobertura";
  const payload = {
    latitud: latitud,
    longitud: longitud,
    ciudad: ciudad,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: tHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Error en la solicitud: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al validar cobertura:", error);
  }
}

async function dameOrderInfo(orderId) {
 const url = 'https://apicloud.farmacorp.com/apishopify/api/v1.0/order/orderscomplete';
  const payload = {
  limit: 1,
    ids: [orderId]
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: tHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Error en la solicitud: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al validar cobertura:", error);
  }
}

async function UpdateCustomer(first_name, last_name, phone, email, idCustomer) {
   showSpinner();
    const url = `https://apicloud.farmacorp.com/apishopify/api/v1.0/account/update/${idCustomer}`;
  
    const payload = {
      first_name: first_name,
      last_name: last_name,
      phone: phone,
      email: email
    };

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers:  tHeaders(),
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al realizar la solicitud:', error);
    }
}

async function associateFarmaclubV2(nombres, apellidos, email, celular, fechaNacimiento, cedula, idClienteShopify, userEmail) {
  const url = `https://apicloud.farmacorp.com/apishopify/api/v2.0/account/vinculate`;
  const paramObject = {
    customerId: idClienteShopify,
    nombres: nombres,
    apellidos: apellidos,
    email: email,
    celular: celular,
    cedula: cedula,
  };
 try {
        const response = await fetch(url, {
            method: 'POST',
            headers:  tHeaders(),
            body: JSON.stringify(paramObject),
        });

        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al realizar la solicitud:', error);
    } 

}

async function attachFarmaclub(cedula, idFarmacorp) {
  const url = `https://apicloud.farmacorp.com/apishopify/api/v1.0/account/attach`;
  const paramObject = {
    idFarmacorp: idFarmacorp,
    docId: cedula,
  };


  try {
        const response = await fetch(url, {
            method: 'POST',
            headers:  uHeaders(),
            body: JSON.stringify(paramObject),
        });

        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al realizar la solicitud:', error);
    } 
  }


  async function setDefaultAdreess(idAddress) {
    showSpinner();
  const url = `https://apicloud.farmacorp.com/apishopify/api/v1.0/account/address/mark_as_default/${idAddress}`;

  try {
        const response = await fetch(url, {
            method: 'PUT',
            headers:  uHeaders()
        });

        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al realizar la solicitud:', error);
    } 
  }

 async function dameOrden(idCustomer, idOrder) {    
    showSpinner();
     var paramObject = {
        id:[idOrder],
        limit: 1,
        status: 'any',
        financialStatus: 'any',
        fulfillmentStatus: 'any',
     };    
  const url = `https://apicloud.farmacorp.com/apishopify/api/v2.0/account/ordersbycustomerid/${idCustomer}`;

  try {
        const response = await fetch(url, {
            method: 'POST',
            headers:  uHeaders(),
            body: JSON.stringify(paramObject),
        });

        if (!response.ok) {
             hideSpinner();
            throw new Error(`Error en la solicitud: ${response.status}`);
        }

        const data = await response.json();
       hideSpinner();
        return data;
    } catch (error) {
       hideSpinner();
        console.error('Error al realizar la solicitud:', error);
    } 
  }

  