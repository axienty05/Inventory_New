import dayjs from 'dayjs';

export function formatDate(date, format = 'DD MMM YYYY') {
  if (!date) return '-';
  return dayjs(date).format(format);
}

export function formatRupiah(amount) {
  if (amount === undefined || amount === null) return 'Rp 0';
  return 'Rp ' + Number(amount).toLocaleString('id-ID');
}
