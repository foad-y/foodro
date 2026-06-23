import * as yup from "yup";
import { toast } from "react-toastify";
import { usePosStore } from "../../store/useProduct";
import { verifyDiscount } from "../../hooks/useDiscount";
import JalaliDatePicker from "../JalaliDatePicker";
import { Customer, useCustomers } from "../../hooks/useCustomer";
import { Address, useAddresses } from "../../hooks/useAddress";
import { useState, useRef, useEffect } from "react";
import {
  BadgePercent,
  Calendar,
  ChevronRight,
  MapPin,
  Phone,
  SquareUserRound,
  UserPlus,
  Loader2
} from "lucide-react";

const checkoutSchema = yup.object({
  type: yup.string().required(),

  regionSearch: yup.string().when("type", {
    is: "delivery",
    then: (schema) => schema.required("منطقه الزامی است"),
    otherwise: (schema) => schema.notRequired(),
  }),

  neighborhoodSearch: yup.string().when("type", {
    is: "delivery",
    then: (schema) => schema.required("محله الزامی است"),
    otherwise: (schema) => schema.notRequired(),
  }),

  address: yup.string().when("type", {
    is: "delivery",
    then: (schema) => schema.required("آدرس الزامی است"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

const CheckoutForm = () => {
  const activeOrder = usePosStore(s => s.getActiveOrder())
  const goToSelectingStep = usePosStore(s => s.goToSelectingStep)
  const setCustomerInfo = usePosStore(s => s.setCustomerInfo)
  const getOrderTotal = usePosStore(s => s.getOrderTotal)
  const setOrderDiscount = usePosStore(s => s.setOrderDiscount)

  const [nameSearch, setNameSearch] = useState(activeOrder?.customer?.name || '')
  const [phoneSearch, setPhoneSearch] = useState(activeOrder?.customer?.phone || '')
  const [showNameSuggestions, setShowNameSuggestions] = useState(false)
  const [showPhoneSuggestions, setShowPhoneSuggestions] = useState(false)

  const [regionSearch, setRegionSearch] = useState('')
  const [neighborhoodSearch, setNeighborhoodSearch] = useState('')
  const [showRegionSuggestions, setShowRegionSuggestions] = useState(false)
  const [showNeighborhoodSuggestions, setShowNeighborhoodSuggestions] = useState(false)

  // const [discountCode, setDiscountCode] = useState('');
  const [loadingDiscount, setLoadingDiscount] = useState(false);
  const [discountSearch, setDiscountSearch] = useState("");
  // const [showDiscountSuggestions, setShowDiscountSuggestions] = useState(false);

  const discountRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null)
  const phoneRef = useRef<HTMLDivElement>(null)
  const regionRef = useRef<HTMLDivElement>(null)
  const neighborhoodRef = useRef<HTMLDivElement>(null)

  const { customers } = useCustomers({
    limit: 3,
    page: 1,
    search: nameSearch ? nameSearch : phoneSearch
  })

  const { addresses } = useAddresses({
    search: ''
  })

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (nameRef.current && !nameRef.current.contains(e.target as Node)) setShowNameSuggestions(false)
      if (phoneRef.current && !phoneRef.current.contains(e.target as Node)) setShowPhoneSuggestions(false)
      if (regionRef.current && !regionRef.current.contains(e.target as Node)) setShowRegionSuggestions(false)
      if (neighborhoodRef.current && !neighborhoodRef.current.contains(e.target as Node)) setShowNeighborhoodSuggestions(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const uniqueRegions = [...new Set(addresses?.map(a => a.region) ?? [])]
  const filteredRegions = regionSearch.length > 0
    ? uniqueRegions.filter(r => r.includes(regionSearch))
    : uniqueRegions

  const filteredNeighborhoods = addresses?.filter(a =>
    (!regionSearch || a.region === regionSearch) &&
    (neighborhoodSearch.length === 0 || a.neighborhood.includes(neighborhoodSearch))
  ) ?? []

  const handleSelectCustomer = (customer: Customer) => {
    setNameSearch(customer.name || '')
    setPhoneSearch(customer.phone || '')
    setCustomerInfo({
      name: customer.name,
      phone: customer.phone,
      gender: customer.gender,
      birthday: customer.birthday,
      address: customer.address,
      id: customer._id,
    })
    setShowNameSuggestions(false)
    setShowPhoneSuggestions(false)
  }

  const handleSelectAddress = (address: Address) => {
    setRegionSearch(address.region)
    setNeighborhoodSearch(address.neighborhood)
    setCustomerInfo({ address: `${address.region} - ${address.neighborhood}`, deliveryPrice: address.price, addressId: address._id })
    setShowRegionSuggestions(false)
    setShowNeighborhoodSuggestions(false)
  }

  const SuggestionList = ({ items, onSelect, renderItem }: { items: any[], onSelect: (item: any) => void, renderItem: (item: any) => React.ReactNode }) => {
    if (items.length === 0) return null
    return (
      <ul className="absolute z-50 top-full right-0 left-0 mt-1 bg-white border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
        {items.map((item, i) => (
          <li
            key={i}
            onMouseDown={() => onSelect(item)}
            className="px-3 py-2 text-xs hover:bg-tertiary cursor-pointer border-b border-border last:border-0 transition-colors"
          >
            {renderItem(item)}
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div>
      <div className="relative flex items-center h-12 text-primarytext">
        <div className="absolute left-1/2 text-sm font-bold -translate-x-1/2">
          نهایی کردن سفارش
        </div>
        <button onClick={() => goToSelectingStep()} className="ml-auto border-[0.1px] border-border hover:cursor-pointer hover:bg-tertiary rounded-full p-2 transition-colors">
          <ChevronRight className='w-4 h-4' />
        </button>
      </div>

      <div className='space-y-2'>

        {/* ===== نام و نام خانوادگی ===== */}
        <p className='text-secondarytext text-xs'>نام و نام خانوادگی</p>
        <div className="relative" ref={nameRef}>
          <div className="absolute inset-y-0 right-3 flex items-center text-secondarytext">
            <UserPlus className="w-4 h-4" />
          </div>
          <input
            value={nameSearch}
            onChange={(e) => {
              setNameSearch(e.target.value)
              setCustomerInfo({ name: e.target.value })
              setShowNameSuggestions(true)
            }}
            onFocus={() => setShowNameSuggestions(true)}
            className="bg-tertiary text-primarytext border border-border transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20 text-xs w-full p-1.5 pr-10 rounded-lg focus:outline-none placeholder:text-tertiarytext"
            placeholder="نام و نام خانوادگی"
          />
          {showNameSuggestions && (
            <SuggestionList
              items={customers}
              onSelect={handleSelectCustomer}
              renderItem={(c) => (
                <div className="flex justify-between items-center">
                  <span className="font-bold text-primarytext">{c.name}</span>
                  <span className="text-tertiarytext">{c.phone}</span>
                </div>
              )}
            />
          )}
        </div>

        {/* ===== شماره تماس ===== */}
        <p className='text-secondarytext text-xs'>شماره تماس</p>
        <div className="relative" ref={phoneRef}>
          <div className="absolute inset-y-0 right-3 flex items-center text-secondarytext">
            <Phone className="w-4 h-4" />
          </div>
          <input
            inputMode="numeric"
            type="tel"
            value={phoneSearch}
            onChange={(e) => {
              setPhoneSearch(e.target.value)
              setCustomerInfo({ phone: e.target.value })
            }}
            onFocus={() => setShowPhoneSuggestions(true)}
            className="bg-tertiary text-primarytext border border-border transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20 text-xs w-full text-right p-1.5 pr-10 rounded-lg focus:outline-none placeholder:text-tertiarytext"
            placeholder="شماره تماس"
          />
          {showPhoneSuggestions && (
            <SuggestionList
              items={customers}
              onSelect={handleSelectCustomer}
              renderItem={(c) => (
                <div className="flex justify-between items-center">
                  <span className="font-bold text-primarytext">{c.name}</span>
                  <span className="text-tertiarytext">{c.phone}</span>
                </div>
              )}
            />
          )}
        </div>

        {/* ===== جنسیت ===== */}
        <p className='text-secondarytext text-xs'>جنسیت</p>
        <div className="relative">
          <div className="absolute inset-y-0 right-3 flex items-center text-secondarytext">
            <SquareUserRound className="w-4 h-4" />
          </div>
          <select
            value={activeOrder?.customer?.gender || ''}
            onChange={(e) => setCustomerInfo({ gender: e.target.value })}
            className="bg-tertiary text-primarytext border border-border transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20 text-xs w-full p-1.5 pr-10 rounded-lg focus:outline-none placeholder:text-tertiarytext"
          >
            <option value="" disabled>جنسیت</option>
            <option value="male">مرد</option>
            <option value="female">زن</option>
          </select>
        </div>

        {/* ===== تاریخ تولد ===== */}
        <p className='text-secondarytext text-xs'>تاریخ تولد</p>
        <div className="flex gap-4 px-3">
          <div className="inset-y-0 right-3 flex items-center text-secondarytext">
            <Calendar className="w-4 h-4" />
          </div>
          <JalaliDatePicker
            value={activeOrder?.customer?.birthday}
            onChange={(date) => setCustomerInfo({ birthday: date })}
          />
        </div>

        {/* ===== آدرس برای پیک موتوری ===== */}
        {activeOrder?.type === 'delivery' && (
          <>
            {/* منطقه */}
            <p className='text-secondarytext text-xs'>منطقه</p>
            <div className="relative" ref={regionRef}>
              <div className="absolute inset-y-0 right-3 flex items-center text-secondarytext">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                value={regionSearch}
                onChange={(e) => {
                  setRegionSearch(e.target.value)
                  setNeighborhoodSearch('')
                  setShowRegionSuggestions(true)
                }}
                onFocus={() => setShowRegionSuggestions(true)}
                className="bg-tertiary text-primarytext border border-border transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20 w-full text-xs p-1.5 pr-10 rounded-lg focus:outline-none placeholder:text-tertiarytext"
                placeholder="منطقه"
              />
              {showRegionSuggestions && filteredRegions.length > 0 && (
                <ul className="absolute z-50 top-full right-0 left-0 mt-1 bg-white border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {filteredRegions.map((region, i) => (
                    <li
                      key={i}
                      onMouseDown={() => {
                        setRegionSearch(region)
                        setShowRegionSuggestions(false)
                        setShowNeighborhoodSuggestions(true)
                      }}
                      className="px-3 py-2 text-xs hover:bg-tertiary cursor-pointer border-b border-border last:border-0 text-primarytext"
                    >
                      {region}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* محله */}
            <p className='text-secondarytext text-xs'>محله</p>
            <div className="relative" ref={neighborhoodRef}>
              <div className="absolute inset-y-0 right-3 flex items-center text-secondarytext">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                value={neighborhoodSearch}
                onChange={(e) => {
                  setNeighborhoodSearch(e.target.value)
                  setShowNeighborhoodSuggestions(true)
                }}
                onFocus={() => setShowNeighborhoodSuggestions(true)}
                className="bg-tertiary text-primarytext border border-border transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20 w-full text-xs p-1.5 pr-10 rounded-lg focus:outline-none placeholder:text-tertiarytext"
                placeholder="محله"
              />
              {showNeighborhoodSuggestions && filteredNeighborhoods.length > 0 && (
                <ul className="absolute top-full right-0 left-0 mt-1 bg-white border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto z-50">
                  {filteredNeighborhoods.map((addr, i) => (
                    <li
                      key={i}
                      onMouseDown={() => handleSelectAddress(addr)}
                      className="px-3 py-2 text-xs hover:bg-tertiary cursor-pointer border-b border-border last:border-0"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-primarytext">{addr.neighborhood}</span>
                        <span className="text-tertiarytext">{addr.price.toLocaleString('fa-IR')} ت</span>
                      </div>
                      <span className="text-tertiarytext">{addr.region}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* ادامه ادرس  */}
            <p className='text-secondarytext text-xs'>آدرس</p>
            <textarea
              value={activeOrder?.customer?.address}
              onChange={(e) => setCustomerInfo({ address: e.target.value })}
              className="bg-tertiary text-primarytext border border-border transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20 text-xs w-full p-3 rounded-lg focus:outline-none placeholder:text-tertiarytext min-h-20 resize-y"
              placeholder="توضیحات تکمیلی آدرس"
            />

            {/* نمایش هزینه پیک */}
            {activeOrder?.customer?.deliveryPrice && (
              <div className="flex justify-between items-center bg-primary/10 border border-primary/20 rounded-lg px-3 py-2">
                <span className="text-xs text-secondarytext">هزینه پیک موتوری</span>
                <span className="text-xs font-bold text-error">
                  {activeOrder.customer.deliveryPrice.toLocaleString('fa-IR')} تومان
                </span>
              </div>
            )}
          </>
        )}

        {/* ===== کد تخفیف ===== */}
        <p className='text-secondarytext text-xs'>کد تخفیف</p>
        <div className="relative" ref={discountRef}>
          <div className="absolute inset-y-0 right-3 flex items-center text-secondarytext">
            <BadgePercent className="w-4 h-4" />
          </div>

          <input
            value={discountSearch}
            onChange={(e) => {
              setDiscountSearch(e.target.value);
            }}
            className="bg-tertiary text-primarytext border border-border transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20 text-xs w-full p-1.5 pr-10 rounded-lg focus:outline-none placeholder:text-tertiarytext"
            placeholder="کد تخفیف"
          />
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={async () => {
              if (activeOrder?.discount) {
                toast.warning("کد تخفیف قبلاً برای این سفارش اعمال شده است");
                return;
              }

              if (!discountSearch.trim()) return;

              try {
                setLoadingDiscount(true);

                const total = activeOrder ? getOrderTotal(activeOrder.id) : 0;

                const result = await verifyDiscount(
                  discountSearch.trim(),
                  total > 0 ? total : undefined
                );

                if (result.valid) {
                  setOrderDiscount({
                    code: result.discount.code,
                    type: result.discount.type,
                    value: result.discount.value,
                    amount: result.discount.discountAmount,
                  });

                  toast.success(`کد تخفیف ${result.discount.name} اعمال شد`);
                }
              } catch (err) {
                const msg =
                  err?.response?.data?.message || 'کد تخفیف نامعتبر است';

                toast.error(msg);
                setOrderDiscount(null);
              } finally {
                setLoadingDiscount(false);
              }
            }}
            disabled={loadingDiscount}
            className="bg-warning text-white text-xs px-3 py-1.5 rounded-lg hover:opacity-80 disabled:opacity-50 flex items-center gap-1 cursor-pointer transition-opacity"
          >
            {loadingDiscount ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              ' اعمال کد تخفیف'
            )}
          </button>
        </div>
        {activeOrder?.discount && (
          <div className="flex justify-between items-center bg-success/10 border border-success/20 rounded-lg px-3 py-2 mt-1">
            <span className="text-xs text-secondarytext">
              تخفیف: {activeOrder.discount.code}
            </span>
            <span className="text-xs font-bold text-success">
              -{activeOrder.discount.amount.toLocaleString('fa-IR')} تومان
            </span>
            <button
              onClick={() => setOrderDiscount(null)}
              className="text-xs text-error mr-auto pr-2 cursor-pointer hover:underline"
            >
              حذف
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CheckoutForm;