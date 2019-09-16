export default function({ redirect, route }) {
  if (route.path === '/') redirect('/product/list')
}
