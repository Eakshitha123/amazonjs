import { cart, removeFromCart, saveToStorage } from '../data/cart.js';
import { products } from '../data/products.js';
import { format } from './utils/money.js';
import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';

import { deliveryoptions } from '../data/deliveryoptions.js';

const today = dayjs();

let cartSummaryHTML = '';

cart.forEach((cartItem) => {
  const productId = cartItem.productId;

  let matchingProduct = products.find((product) => product.id === productId);

  const deliveryoptionId = cartItem.deliveryoptionId;

  let deliveryoption = deliveryoptions.find((option) => option.id === deliveryoptionId);

  const deliveryDate = today.add(deliveryoption.deliveryDays, 'days');
  const dateString = deliveryDate.format('dddd, MMMM D');

  cartSummaryHTML += `
    <div class="cart-item-container js-cart-item-container-${matchingProduct.id}">
      <div class="delivery-date js-delivery-date-${matchingProduct.id}">
        Delivery date: ${dateString}
      </div>

      <div class="cart-item-details-grid">
        <img class="product-image" src="${matchingProduct.image}" />

        <div class="cart-item-details">
          <div class="product-name">
            ${matchingProduct.name}
          </div>
          <div class="product-price">
            $${format(matchingProduct.priceCents)}
          </div>
          <div class="product-quantity">
            <span>
              Quantity: <span class="quantity-label">${cartItem.quantity}</span>
            </span>
            <span class="update-quantity-link link-primary">
              Update
            </span>
            <span class="delete-quantity-link link-primary js-delete-link" data-product-id="${matchingProduct.id}">
              Delete
            </span>
          </div>
        </div>

        <div class="delivery-options">
          <div class="delivery-options-title">
            Choose a delivery option:
          </div>
          ${deliveryoptionsHTML(matchingProduct, cartItem)}
        </div>
      </div>
    </div>`;
});

document.querySelector('.js-order-summary').innerHTML = cartSummaryHTML;

// Delivery options HTML function
function deliveryoptionsHTML(matchingProduct, cartItem) {
  let html = '';

  deliveryoptions.forEach((deliveryoption) => {
    const today = dayjs();
    const deliveryDate = today.add(deliveryoption.deliveryDays, 'days');
    const dateString = deliveryDate.format('dddd, MMMM D');
    const priceString = deliveryoption.priceCents === 0 ? 'Free' : `$${format(deliveryoption.priceCents)}`;
    const isChecked = deliveryoption.id === cartItem.deliveryoptionId;

    html += `
      <div class="delivery-option">
        <input type="radio" ${isChecked ? 'checked' : ''} 
               class="delivery-option-input js-delivery-option"
               name="delivery-option-${matchingProduct.id}"
               value="${deliveryoption.id}"
               data-product-id="${matchingProduct.id}"
               data-delivery-days="${deliveryoption.deliveryDays}">
        <div>
          <div class="delivery-option-date">
            ${dateString}
          </div>
          <div class="delivery-option-price">
            ${priceString} - Shipping
          </div>
        </div>
      </div>`;
  });

  return html;
}

// Add event listeners to delivery option radio buttons
document.querySelectorAll('.js-delivery-option').forEach((radio) => {
  radio.addEventListener('change', (event) => {
    const productId = event.target.dataset.productId;
    const deliveryDays = Number(event.target.dataset.deliveryDays);

    // Calculate the new delivery date
    const newDeliveryDate = today.add(deliveryDays, 'days').format('dddd, MMMM D');

    // Update the delivery date in the DOM
    const deliveryDateElement = document.querySelector(`.js-delivery-date-${productId}`);
    if (deliveryDateElement) {
      deliveryDateElement.textContent = `Delivery date: ${newDeliveryDate}`;
    }
  });
});

// Add event listeners for delete links
document.querySelectorAll('.js-delete-link').forEach((link) => {
  link.addEventListener('click', () => {
    const productId = Number(link.dataset.productId); // Ensure productId is a number
    removeFromCart(productId);

    const container = document.querySelector(`.js-cart-item-container-${productId}`);
    if (container) {
      container.remove();
    }

    saveToStorage(cart); // Save the updated cart after removal
  });
});
