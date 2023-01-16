import { useState, useEffect, useRef } from "react";
import { type Product } from "../../interfaces/products";
import { Header } from "../../components";
import Swal from "sweetalert2";

export default function Cart() {
  const [products, setProducts] = useState(
    JSON.parse(localStorage.getItem("products_cart") ?? "[]")
  );

  const [nItem, setNum] = useState(
    Number(JSON.parse(localStorage.getItem("n_item") ?? "[]"))
  );

  const [total, setTotal] = useState(0);

  const [pay, setPay] = useState(false);

  const dataFetchedRef = useRef(false);

  const deleteProducts = (product: Product) => {
    const newProducts = products.filter(
      (productO: Product) => productO.id !== product.id
    );
    setProducts(newProducts);
    setNum(nItem - 1);
    Swal.fire({
      position: "bottom-end",
      icon: "success",
      title: "¡Eliminado!",
      showConfirmButton: false,
      background: "#242424",
      color: "#fff",
      timer: 1250,
    });
  };

  useEffect(() => {
    const sum = products.reduce(
      (acc: number, product: Product) => acc + product.price,
      0
    );
    setTotal(sum);
  }, []);

  useEffect(() => {
    if (products.length == 0) {
      localStorage.removeItem("products_cart");
      setPay(false);
    } else {
      localStorage.setItem("products_cart", JSON.stringify(products));
    }
    localStorage.setItem("n_item", JSON.stringify(nItem));
  }, [products]);

  useEffect(() => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;

    const mp = new MercadoPago("TEST-29ee7aff-fd77-4115-be63-7fad7d8d6fa0", {
      ale: "es",
    });
    const bricksBuilder = mp.bricks();
    const renderCardPaymentBrick = async (bricksBuilder: any) => {
      const settings = {
        initialization: {
          amount: products.reduce(
            (acc: number, product: Product) => acc + product.price,
            0
          ), // monto a ser pago
          payer: {
            email: "juanjonieto@",
          },
        },
        customization: {
          visual: {
            style: {
              theme: "default",
            },
          },
        },
        callbacks: {
          onReady: () => {},
          onSubmit: async (cardFormData: any) => {
            const response = await fetch(
              "http://localhost:3000//fn-mercadopago",
              {
                method: "POST", 
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(cardFormData),
              }
            );
          },
          onError: (error: any) => {
            // callback llamado para todos los casos de error de Brick
          },
        },
      };
      window.cardPaymentBrickController = await bricksBuilder.create(
        "cardPayment",
        "cardPaymentBrick_container",
        settings
      );
    };
    renderCardPaymentBrick(bricksBuilder);
  }, []);

  const hidePay = () => {
    pay ? setPay(false) : setPay(true);
  };
  return (
    <>
      <Header />
      <div className="container mt-3">
        <h1 className="center">Carrito de compras</h1>
        {products.length === 0 && (
          <div className="noProduct">No hay productos añadidos</div>
        )}
        <div className="row mt-5">
          <div className="col-md-8">
            {products.map((product: Product) => (
              <div className="card mb-3" key={product.id}>
                <div className="card-body">
                  <h2>{product.name}</h2>
                  <p>{product.description}</p>
                  <p>$ {product.price}</p>
                  <button
                    className="btn btn-danger"
                    onClick={() => deleteProducts(product)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <h4>Resumen de compra</h4>
                <p>Productos: {nItem}</p>
                <p>Total: $ {total} </p>
                <div className="d-grid">
                  <button className="btn btn-success" onClick={hidePay}>
                    Pagar
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div
            className="col-md-6"
            id="cardPaymentBrick_container"
            style={{ display: pay ? "block" : "none" }}
          ></div>
        </div>
      </div>
    </>
  );
}
