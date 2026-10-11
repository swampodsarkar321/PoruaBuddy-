export const waNumber = (num: string) => num.replace(/[^0-9]/g, '');

export const waLink = (num: string, text: string) =>
  `https://wa.me/${waNumber(num)}?text=${encodeURIComponent(text)}`;

export const singleOrderMessage = (name: string, price: number) =>
  `Hello Sairah Labs! I want to order:\n\n1. ${name} — ৳${price.toLocaleString()}\n\nTotal: ৳${price.toLocaleString()}\n\nMy name:\nDelivery address:`;

export const cartOrderMessage = (
  items: Array<{ name: string; qty: number; price: number }>,
  total: number
) => {
  const lines = items.map((i, idx) => `${idx + 1}. ${i.name} x${i.qty} — ৳${(i.price * i.qty).toLocaleString()}`);
  return `Hello Sairah Labs! I want to order:\n\n${lines.join('\n')}\n\nTotal: ৳${total.toLocaleString()}\n\nMy name:\nDelivery address:`;
};
